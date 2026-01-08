<?php

namespace App\Controller;

use App\Entity\Order;
use App\Repository\OrderRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/reports')]
class ReportController extends AbstractController
{
    public function __construct(
        private OrderRepository $orderRepository,
    ) {
    }

    #[Route('', name: 'api_reports', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $from = $request->query->get('from');
        $to = $request->query->get('to');

        // Get all orders for the period
        $orders = $this->orderRepository->findAll();

        $totalOrders = count($orders);
        $totalAmount = '0.00';
        $statusCounts = [];

        foreach ($orders as $order) {
            $totalAmount = bcadd($totalAmount, $order->getTotalAmount(), 2);
            $status = $order->getStatus();
            $statusCounts[$status] = ($statusCounts[$status] ?? 0) + 1;
        }

        $avgOrder = $totalOrders > 0 ? bcdiv($totalAmount, (string) $totalOrders, 2) : '0.00';

        return $this->json([
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalAmount' => $totalAmount,
                'averageOrder' => $avgOrder,
                'savings' => '0.00', // Placeholder
            ],
            'byStatus' => $statusCounts,
            'monthlyData' => [], // Simplified for prototype
            'topProducts' => [], // Simplified for prototype
            'hotelPerformance' => [], // Simplified for prototype
        ]);
    }
}
