<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\User;
use App\Repository\BranchRepository;
use App\Repository\OrderRepository;
use App\Repository\ProductOfferRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/orders')]
class OrderController extends AbstractController
{
    public function __construct(
        private OrderRepository $orderRepository,
        private BranchRepository $branchRepository,
        private ProductOfferRepository $productOfferRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('', name: 'api_orders', methods: ['GET'])]
    public function index(#[CurrentUser] ?User $user, Request $request): JsonResponse
    {
        $status = $request->query->get('status');
        $userId = $request->query->get('userId');
        
        // If userId is provided in query, use that user
        if ($userId) {
            $targetUserId = (int) $userId;
        } elseif ($user) {
            // Use logged in user
            $targetUserId = $user->getId();
        } else {
            // Fallback to first user for demo purposes
            $defaultUser = $this->userRepository->findOneBy([]);
            $targetUserId = $defaultUser?->getId();
        }
        
        $orders = $targetUserId ? $this->orderRepository->findByUser($targetUserId, $status) : [];

        return $this->json([
            'orders' => array_map(fn($order) => $this->serializeOrder($order), $orders),
            'total' => count($orders),
        ]);
    }

    #[Route('/pending', name: 'api_orders_pending', methods: ['GET'])]
    public function pending(): JsonResponse
    {
        $orders = $this->orderRepository->findPendingApproval();

        return $this->json([
            'orders' => array_map(fn($order) => $this->serializeOrder($order), $orders),
            'total' => count($orders),
        ]);
    }

    #[Route('', name: 'api_orders_create', methods: ['POST'])]
    public function create(#[CurrentUser] ?User $user, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $branchId = $data['branchId'] ?? null;
        $items = $data['items'] ?? [];
        $userId = $data['userId'] ?? null;

        if (!$branchId || empty($items)) {
            return $this->json(['error' => 'Branch and items are required'], Response::HTTP_BAD_REQUEST);
        }

        $branch = $this->branchRepository->find($branchId);
        if (!$branch) {
            return $this->json(['error' => 'Branch not found'], Response::HTTP_NOT_FOUND);
        }

        // If userId is provided in request body, use that user
        if ($userId) {
            $user = $this->userRepository->find($userId);
        }
        
        // If still no user, use the first user as default (for demo purposes)
        if (!$user) {
            $user = $this->userRepository->findOneBy([]);
            if (!$user) {
                return $this->json(['error' => 'No user available'], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $order = new Order();
        $order->setOrderNumber($this->orderRepository->generateOrderNumber());
        $order->setBranch($branch);
        $order->setCreatedBy($user);
        $order->setStatus(Order::STATUS_DRAFT);
        $order->setPriority($data['priority'] ?? Order::PRIORITY_MEDIUM);
        $order->setNote($data['note'] ?? null);

        foreach ($items as $itemData) {
            $offer = $this->productOfferRepository->find($itemData['productOfferId']);
            if (!$offer) {
                continue;
            }

            $orderItem = new OrderItem();
            $orderItem->setProductOffer($offer);
            $orderItem->setQuantity($itemData['quantity'] ?? 1);
            $order->addItem($orderItem);
        }

        $order->recalculateTotal();

        $this->entityManager->persist($order);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'order' => $this->serializeOrder($order),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_orders_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $order = $this->orderRepository->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serializeOrder($order, true));
    }

    #[Route('/{id}/submit', name: 'api_orders_submit', methods: ['POST'])]
    public function submit(int $id): JsonResponse
    {
        $order = $this->orderRepository->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        if ($order->getStatus() !== Order::STATUS_DRAFT) {
            return $this->json(['error' => 'Order cannot be submitted'], Response::HTTP_BAD_REQUEST);
        }

        $order->setStatus(Order::STATUS_SUBMITTED);
        $order->setSubmittedAt(new \DateTimeImmutable());

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'order' => $this->serializeOrder($order),
        ]);
    }

    #[Route('/{id}/approve', name: 'api_orders_approve', methods: ['POST'])]
    public function approve(#[CurrentUser] ?User $user, int $id): JsonResponse
    {
        $order = $this->orderRepository->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        if ($order->getStatus() !== Order::STATUS_SUBMITTED) {
            return $this->json(['error' => 'Order cannot be approved'], Response::HTTP_BAD_REQUEST);
        }

        // If no user is logged in, use the first user as default (for demo purposes)
        if (!$user) {
            $user = $this->userRepository->findOneBy([]);
        }

        $order->setStatus(Order::STATUS_APPROVED);
        $order->setApprovedAt(new \DateTimeImmutable());
        $order->setApprovedBy($user);

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'order' => $this->serializeOrder($order),
        ]);
    }

    #[Route('/{id}/reject', name: 'api_orders_reject', methods: ['POST'])]
    public function reject(int $id): JsonResponse
    {
        $order = $this->orderRepository->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        if ($order->getStatus() !== Order::STATUS_SUBMITTED) {
            return $this->json(['error' => 'Order cannot be rejected'], Response::HTTP_BAD_REQUEST);
        }

        $order->setStatus(Order::STATUS_REJECTED);

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'order' => $this->serializeOrder($order),
        ]);
    }

    private function serializeOrder(Order $order, bool $includeItems = false): array
    {
        $data = [
            'id' => $order->getId(),
            'orderNumber' => $order->getOrderNumber(),
            'status' => $order->getStatus(),
            'priority' => $order->getPriority(),
            'totalAmount' => $order->getTotalAmount(),
            'currency' => $order->getCurrency(),
            'itemCount' => $order->getItemCount(),
            'note' => $order->getNote(),
            'createdAt' => $order->getCreatedAt()->format('c'),
            'submittedAt' => $order->getSubmittedAt()?->format('c'),
            'approvedAt' => $order->getApprovedAt()?->format('c'),
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

        if ($includeItems) {
            $data['items'] = array_map(function (OrderItem $item) {
                $offer = $item->getProductOffer();
                $product = $offer->getProduct();
                return [
                    'id' => $item->getId(),
                    'quantity' => $item->getQuantity(),
                    'unitPrice' => $item->getUnitPrice(),
                    'totalPrice' => $item->getTotalPrice(),
                    'product' => [
                        'id' => $product->getId(),
                        'name' => $product->getName(),
                        'unit' => $product->getUnit(),
                    ],
                    'supplier' => [
                        'id' => $offer->getSupplier()->getId(),
                        'name' => $offer->getSupplier()->getName(),
                    ],
                ];
            }, $order->getItems()->toArray());
        }

        return $data;
    }
}
