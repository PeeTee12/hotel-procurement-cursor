<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\CategoryRepository;
use App\Repository\ProductRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/products')]
class ProductController extends AbstractController
{
    public function __construct(
        private ProductRepository $productRepository,
        private CategoryRepository $categoryRepository,
    ) {
    }

    #[Route('', name: 'api_products', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $categoryId = $request->query->get('category');
        $search = $request->query->get('search');

        $products = $this->productRepository->findByCategory(
            $categoryId ? (int) $categoryId : null,
            $search
        );

        return $this->json([
            'products' => array_map(fn($product) => $this->serializeProduct($product), $products),
            'total' => count($products),
        ]);
    }

    #[Route('/categories', name: 'api_product_categories', methods: ['GET'])]
    public function categories(): JsonResponse
    {
        $categories = $this->categoryRepository->findRootCategories();

        return $this->json([
            'categories' => array_map(fn($cat) => $this->serializeCategory($cat), $categories),
        ]);
    }

    #[Route('/{id}', name: 'api_product_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $product = $this->productRepository->find($id);

        if (!$product) {
            return $this->json(['error' => 'Product not found'], 404);
        }

        return $this->json($this->serializeProduct($product));
    }

    private function serializeProduct(Product $product): array
    {
        $offers = [];
        foreach ($product->getProductOffers() as $offer) {
            if ($offer->isActive()) {
                $offers[] = [
                    'id' => $offer->getId(),
                    'price' => $offer->getPrice(),
                    'currency' => $offer->getCurrency(),
                    'supplier' => [
                        'id' => $offer->getSupplier()->getId(),
                        'name' => $offer->getSupplier()->getName(),
                    ],
                ];
            }
        }

        // Get best price
        $bestOffer = null;
        foreach ($offers as $offer) {
            if ($bestOffer === null || (float) $offer['price'] < (float) $bestOffer['price']) {
                $bestOffer = $offer;
            }
        }

        return [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'unit' => $product->getUnit(),
            'image' => $product->getImage(),
            'category' => $product->getCategory() ? [
                'id' => $product->getCategory()->getId(),
                'name' => $product->getCategory()->getName(),
            ] : null,
            'offers' => $offers,
            'bestPrice' => $bestOffer ? $bestOffer['price'] : null,
            'currency' => $bestOffer ? $bestOffer['currency'] : 'CZK',
        ];
    }

    private function serializeCategory($category): array
    {
        $children = [];
        $childrenProductCount = 0;
        
        foreach ($category->getChildren() as $child) {
            $serializedChild = $this->serializeCategory($child);
            $children[] = $serializedChild;
            $childrenProductCount += $serializedChild['productCount'];
        }

        // Count products in this category plus all subcategories
        $directProductCount = $category->getProducts()->count();
        $totalProductCount = $directProductCount + $childrenProductCount;

        return [
            'id' => $category->getId(),
            'name' => $category->getName(),
            'icon' => $category->getIcon(),
            'children' => $children,
            'productCount' => $totalProductCount,
        ];
    }
}
