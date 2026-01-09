<?php

namespace App\Controller;

use App\Entity\Shipment;
use App\Repository\ShipmentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/shipments')]
class ShipmentController extends AbstractController
{
    public function __construct(
        private ShipmentRepository $shipmentRepository,
        private EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('', name: 'api_shipments', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $shipments = $this->shipmentRepository->findAll();

        return $this->json([
            'shipments' => array_map(fn($shipment) => $this->serializeShipment($shipment), $shipments),
            'total' => count($shipments),
        ]);
    }

    #[Route('/{id}', name: 'api_shipments_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $shipment = $this->shipmentRepository->find($id);

        if (!$shipment) {
            return $this->json(['error' => 'Shipment not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['orderNumber'])) {
            $shipment->setOrderNumber($data['orderNumber'] ?: null);
        }

        if (isset($data['trackingNumber'])) {
            $shipment->setTrackingNumber($data['trackingNumber'] ?: null);
        }

        $order = $shipment->getOrder();
        $order->setStatus('pending');
        $shipment->setOrder($order);

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'shipment' => $this->serializeShipment($shipment),
        ]);
    }

    #[Route('/{id}/deliver', name: 'api_shipments_deliver', methods: ['PUT'])]
    public function deliver(int $id): JsonResponse
    {
        $shipment = $this->shipmentRepository->find($id);

        if (!$shipment) {
            return $this->json(['error' => 'Shipment not found'], Response::HTTP_NOT_FOUND);
        }

        $order = $shipment->getOrder();
        $order->setStatus('delivered');

        $shipment->setDeliveredAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'shipment' => $this->serializeShipment($shipment),
        ]);
    }

    private function serializeShipment(Shipment $shipment): array
    {
        return [
            'id' => $shipment->getId(),
            'orderNumber' => $shipment->getOrderNumber(),
            'trackingNumber' => $shipment->getTrackingNumber(),
            'createdAt' => $shipment->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $shipment->getUpdatedAt()?->format('Y-m-d H:i:s'),
            'deliveredAt' => $shipment->getDeliveredAt()?->format('Y-m-d H:i:s'),
            'order' => $shipment->getOrder() ? [
                'id' => $shipment->getOrder()->getId(),
                'orderNumber' => $shipment->getOrder()->getOrderNumber(),
            ] : null,
        ];
    }
}
