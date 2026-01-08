<?php

namespace App\Controller;

use App\Entity\Supplier;
use App\Repository\SupplierRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/suppliers')]
class SupplierController extends AbstractController
{
    public function __construct(
        private SupplierRepository $supplierRepository,
        private EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('', name: 'api_suppliers', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $suppliers = $this->supplierRepository->findAll();

        $active = array_filter($suppliers, fn($s) => $s->getStatus() === Supplier::STATUS_ACTIVE);
        $withErrors = array_filter($suppliers, fn($s) => $s->getStatus() === Supplier::STATUS_ERROR);

        return $this->json([
            'suppliers' => array_map(fn($s) => $this->serializeSupplier($s), $suppliers),
            'stats' => [
                'active' => count($active),
                'withErrors' => count($withErrors),
                'total' => count($suppliers),
            ],
        ]);
    }

    #[Route('', name: 'api_suppliers_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $supplier = new Supplier();
        $supplier->setName($data['name'] ?? '');
        $supplier->setCategory($data['category'] ?? null);
        $supplier->setApiEndpoint($data['apiEndpoint'] ?? null);
        $supplier->setStatus(Supplier::STATUS_ACTIVE);

        $this->entityManager->persist($supplier);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'supplier' => $this->serializeSupplier($supplier),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_suppliers_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $supplier = $this->supplierRepository->find($id);

        if (!$supplier) {
            return $this->json(['error' => 'Supplier not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serializeSupplier($supplier));
    }

    #[Route('/{id}/sync', name: 'api_suppliers_sync', methods: ['POST'])]
    public function sync(int $id): JsonResponse
    {
        $supplier = $this->supplierRepository->find($id);

        if (!$supplier) {
            return $this->json(['error' => 'Supplier not found'], Response::HTTP_NOT_FOUND);
        }

        // Simulate sync
        $supplier->setLastSyncAt(new \DateTimeImmutable());
        $supplier->setStatus(Supplier::STATUS_ACTIVE);

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'supplier' => $this->serializeSupplier($supplier),
        ]);
    }

    private function serializeSupplier(Supplier $supplier): array
    {
        return [
            'id' => $supplier->getId(),
            'name' => $supplier->getName(),
            'category' => $supplier->getCategory(),
            'productCount' => $supplier->getProductCount(),
            'ordersPerMonth' => $supplier->getOrdersPerMonth(),
            'status' => $supplier->getStatus(),
            'lastSyncAt' => $supplier->getLastSyncAt()?->format('c'),
            'apiEndpoint' => $supplier->getApiEndpoint(),
        ];
    }
}
