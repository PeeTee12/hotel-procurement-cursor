<?php

namespace App\Controller;

use App\Entity\Order;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/reports')]
class ReportController extends AbstractController
{
    public function __construct(
        private OrderRepository $orderRepository,
        private EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('', name: 'api_reports', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $from = $request->query->get('from');
        $to = $request->query->get('to');

        // Build query for orders in date range
        $qb = $this->orderRepository->createQueryBuilder('o')
            ->leftJoin('o.branch', 'b')
            ->leftJoin('o.items', 'i')
            ->leftJoin('i.productOffer', 'po')
            ->leftJoin('po.product', 'p')
            ->addSelect('b', 'i', 'po', 'p');

        if ($from) {
            $qb->andWhere('o.createdAt >= :from')
                ->setParameter('from', new \DateTimeImmutable($from));
        }

        if ($to) {
            $qb->andWhere('o.createdAt <= :to')
                ->setParameter('to', new \DateTimeImmutable($to . ' 23:59:59'));
        }

        $orders = $qb->getQuery()->getResult();

        // Calculate stats
        $totalOrders = count($orders);
        $totalAmount = '0.00';
        $statusCounts = [];

        foreach ($orders as $order) {
            $totalAmount = bcadd($totalAmount, $order->getTotalAmount(), 2);
            $status = $order->getStatus();
            $statusCounts[$status] = ($statusCounts[$status] ?? 0) + 1;
        }

        $avgOrder = $totalOrders > 0 ? bcdiv($totalAmount, (string) $totalOrders, 2) : '0.00';
        $savings = bcdiv(bcmul($totalAmount, '0.05', 2), '1', 2); // 5% savings estimate

        // Monthly data (last 6 months)
        $monthlyData = [];
        $now = new \DateTimeImmutable();
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = $now->modify("-$i months")->modify('first day of this month')->setTime(0, 0, 0);
            $monthEnd = $now->modify("-$i months")->modify('last day of this month')->setTime(23, 59, 59);
            
            $monthOrders = array_filter($orders, function($order) use ($monthStart, $monthEnd) {
                $createdAt = $order->getCreatedAt();
                return $createdAt >= $monthStart && $createdAt <= $monthEnd;
            });

            $monthTotal = '0.00';
            foreach ($monthOrders as $order) {
                $monthTotal = bcadd($monthTotal, $order->getTotalAmount(), 2);
            }

            $monthlyData[] = [
                'month' => $monthStart->format('n/Y'),
                'label' => $monthStart->format('M Y'),
                'orders' => count($monthOrders),
                'amount' => $monthTotal,
            ];
        }

        // Top products (by quantity)
        $productCounts = [];
        foreach ($orders as $order) {
            foreach ($order->getItems() as $item) {
                $product = $item->getProductOffer()->getProduct();
                $productId = $product->getId();
                $productName = $product->getName();
                
                if (!isset($productCounts[$productId])) {
                    $productCounts[$productId] = [
                        'name' => $productName,
                        'quantity' => 0,
                        'total' => '0.00',
                    ];
                }
                
                $productCounts[$productId]['quantity'] += $item->getQuantity();
                $productCounts[$productId]['total'] = bcadd(
                    $productCounts[$productId]['total'],
                    $item->getTotalPrice(),
                    2
                );
            }
        }

        usort($productCounts, function($a, $b) {
            return $b['quantity'] <=> $a['quantity'];
        });

        $topProducts = array_slice($productCounts, 0, 10);

        // Hotel performance
        $hotelStats = [];
        foreach ($orders as $order) {
            $branch = $order->getBranch();
            $branchId = $branch->getId();
            $branchName = $branch->getName();

            if (!isset($hotelStats[$branchId])) {
                $hotelStats[$branchId] = [
                    'name' => $branchName,
                    'orders' => 0,
                    'total' => '0.00',
                ];
            }

            $hotelStats[$branchId]['orders']++;
            $hotelStats[$branchId]['total'] = bcadd(
                $hotelStats[$branchId]['total'],
                $order->getTotalAmount(),
                2
            );
        }

        $hotelPerformance = [];
        foreach ($hotelStats as $stats) {
            $avg = $stats['orders'] > 0 
                ? bcdiv($stats['total'], (string) $stats['orders'], 2)
                : '0.00';
            
            $hotelPerformance[] = [
                'name' => $stats['name'],
                'orders' => $stats['orders'],
                'total' => $stats['total'],
                'average' => $avg,
            ];
        }

        usort($hotelPerformance, function($a, $b) {
            return (float) $b['total'] <=> (float) $a['total'];
        });

        return $this->json([
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalAmount' => $totalAmount,
                'averageOrder' => $avgOrder,
                'savings' => $savings,
            ],
            'byStatus' => $statusCounts,
            'monthlyData' => $monthlyData,
            'topProducts' => $topProducts,
            'hotelPerformance' => $hotelPerformance,
        ]);
    }
}
