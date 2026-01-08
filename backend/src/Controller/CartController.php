<?php

namespace App\Controller;

use App\Repository\ProductOfferRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/cart')]
class CartController extends AbstractController
{
    private const CART_KEY = 'cart_items';

    public function __construct(
        private RequestStack $requestStack,
        private ProductOfferRepository $productOfferRepository,
    ) {
    }

    #[Route('', name: 'api_cart', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $cart = $this->getCart();
        $items = $this->hydrateCartItems($cart);

        $total = '0.00';
        foreach ($items as $item) {
            $total = bcadd($total, $item['totalPrice'], 2);
        }

        return $this->json([
            'items' => $items,
            'total' => $total,
            'itemCount' => count($items),
        ]);
    }

    #[Route('/add', name: 'api_cart_add', methods: ['POST'])]
    public function add(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $offerId = $data['productOfferId'] ?? null;
        $quantity = $data['quantity'] ?? 1;

        if (!$offerId) {
            return $this->json(['error' => 'Product offer ID is required'], Response::HTTP_BAD_REQUEST);
        }

        $offer = $this->productOfferRepository->find($offerId);
        if (!$offer) {
            return $this->json(['error' => 'Product offer not found'], Response::HTTP_NOT_FOUND);
        }

        $cart = $this->getCart();
        
        // Check if item already in cart
        $found = false;
        foreach ($cart as &$item) {
            if ($item['productOfferId'] === $offerId) {
                $item['quantity'] += $quantity;
                $found = true;
                break;
            }
        }

        if (!$found) {
            $cart[] = [
                'productOfferId' => $offerId,
                'quantity' => $quantity,
            ];
        }

        $this->saveCart($cart);

        return $this->json([
            'success' => true,
            'cart' => $this->hydrateCartItems($cart),
        ]);
    }

    #[Route('/update', name: 'api_cart_update', methods: ['PUT'])]
    public function update(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $offerId = $data['productOfferId'] ?? null;
        $quantity = $data['quantity'] ?? 1;

        if (!$offerId) {
            return $this->json(['error' => 'Product offer ID is required'], Response::HTTP_BAD_REQUEST);
        }

        $cart = $this->getCart();
        
        foreach ($cart as &$item) {
            if ($item['productOfferId'] === $offerId) {
                $item['quantity'] = $quantity;
                break;
            }
        }

        $this->saveCart($cart);

        return $this->json([
            'success' => true,
            'cart' => $this->hydrateCartItems($cart),
        ]);
    }

    #[Route('/remove/{offerId}', name: 'api_cart_remove', methods: ['DELETE'])]
    public function remove(int $offerId): JsonResponse
    {
        $cart = $this->getCart();
        $cart = array_filter($cart, fn($item) => $item['productOfferId'] !== $offerId);
        $cart = array_values($cart);

        $this->saveCart($cart);

        return $this->json([
            'success' => true,
            'cart' => $this->hydrateCartItems($cart),
        ]);
    }

    #[Route('/clear', name: 'api_cart_clear', methods: ['DELETE'])]
    public function clear(): JsonResponse
    {
        $this->saveCart([]);

        return $this->json([
            'success' => true,
            'cart' => [],
        ]);
    }

    private function getCart(): array
    {
        $session = $this->requestStack->getSession();
        return $session->get(self::CART_KEY, []);
    }

    private function saveCart(array $cart): void
    {
        $session = $this->requestStack->getSession();
        $session->set(self::CART_KEY, $cart);
    }

    private function hydrateCartItems(array $cart): array
    {
        $items = [];

        foreach ($cart as $cartItem) {
            $offer = $this->productOfferRepository->find($cartItem['productOfferId']);
            if (!$offer) {
                continue;
            }

            $product = $offer->getProduct();
            $quantity = $cartItem['quantity'];
            $totalPrice = bcmul($offer->getPrice(), (string) $quantity, 2);

            $items[] = [
                'productOfferId' => $offer->getId(),
                'quantity' => $quantity,
                'unitPrice' => $offer->getPrice(),
                'totalPrice' => $totalPrice,
                'currency' => $offer->getCurrency(),
                'product' => [
                    'id' => $product->getId(),
                    'name' => $product->getName(),
                    'unit' => $product->getUnit(),
                    'image' => $product->getImage(),
                ],
                'supplier' => [
                    'id' => $offer->getSupplier()->getId(),
                    'name' => $offer->getSupplier()->getName(),
                ],
            ];
        }

        return $items;
    }
}
