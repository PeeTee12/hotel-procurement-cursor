<?php

namespace App\Repository;

use App\Entity\Product;
use App\Repository\CategoryRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(
        ManagerRegistry $registry,
        private CategoryRepository $categoryRepository,
    ) {
        parent::__construct($registry, Product::class);
    }

    public function findByCategory(?int $categoryId = null, ?string $search = null): array
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.productOffers', 'po')
            ->leftJoin('po.supplier', 's')
            ->leftJoin('p.category', 'c')
            ->addSelect('po', 's', 'c');

        if ($categoryId !== null) {
            // Get all subcategory IDs including the selected category
            $categoryIds = $this->getAllCategoryIds($categoryId);
            $qb->andWhere('p.category IN (:categoryIds)')
                ->setParameter('categoryIds', $categoryIds);
        }

        if ($search !== null && $search !== '') {
            $qb->andWhere('p.name LIKE :search OR p.description LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        return $qb->orderBy('p.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get all category IDs including subcategories recursively
     */
    private function getAllCategoryIds(int $categoryId): array
    {
        $category = $this->categoryRepository->find($categoryId);
        if (!$category) {
            return [$categoryId];
        }

        $ids = [$categoryId];
        foreach ($category->getChildren() as $child) {
            $ids = array_merge($ids, $this->getAllCategoryIds($child->getId()));
        }

        return $ids;
    }

    public function findWithOffers(): array
    {
        return $this->createQueryBuilder('p')
            ->leftJoin('p.productOffers', 'po')
            ->leftJoin('po.supplier', 's')
            ->leftJoin('p.category', 'c')
            ->addSelect('po', 's', 'c')
            ->andWhere('po.isActive = true')
            ->orderBy('p.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
