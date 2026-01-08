<?php

namespace App\Controller;

use App\Entity\Order;
use App\Repository\OrderRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/dashboard')]
class DashboardController extends AbstractController
{
    public function __construct(
        private OrderRepository $orderRepository,
    ) {
    }

    #[Route('', name: 'api_dashboard', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $statusCounts = $this->orderRepository->countByStatus();
        $totalAmount = $this->orderRepository->getTotalAmount();
        $recentOrders = $this->orderRepository->findRecent(5);
        $pendingOrders = $this->orderRepository->findPendingApproval();

        $statusMap = [];
        foreach ($statusCounts as $item) {
            $statusMap[$item['status']] = (int) $item['count'];
        }

        $totalOrders = array_sum($statusMap);
        $pendingCount = $statusMap[Order::STATUS_SUBMITTED] ?? 0;
        $approvedToday = 0; // Simplified for prototype

        return $this->json([
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalAmount' => $totalAmount,
                'pendingApproval' => $pendingCount,
                'approvedToday' => $approvedToday,
                'urgentOrders' => 0,
            ],
            'recentOrders' => array_map(fn($order) => $this->serializeOrder($order), $recentOrders),
            'pendingApproval' => array_map(fn($order) => $this->serializeOrder($order), $pendingOrders),
        ]);
    }

    private function serializeOrder(Order $order): array
    {
        return [
            'id' => $order->getId(),
            'orderNumber' => $order->getOrderNumber(),
            'status' => $order->getStatus(),
            'priority' => $order->getPriority(),
            'totalAmount' => $order->getTotalAmount(),
            'currency' => $order->getCurrency(),
            'itemCount' => $order->getItemCount(),
            'createdAt' => $order->getCreatedAt()->format('c'),
            'submittedAt' => $order->getSubmittedAt()?->format('c'),
            'branch' => [
                'id' => $order->getBranch()->getId(),
                'name' => $order->getBranch()->getName(),
                'organization' => [
                    'id' => $order->getBranch()->getOrganization()->getId(),
                    'name' => $order->getBranch()->getOrganization()->getName(),
                ],
            ],
            'createdBy' => [
                'id' => $order->getCreatedBy()->getId(),
                'name' => $order->getCreatedBy()->getName(),
            ],
        ];
    }
}
