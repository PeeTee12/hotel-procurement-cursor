<?php

namespace App\Repository;

use App\Entity\ProductOffer;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProductOffer>
 */
class ProductOfferRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProductOffer::class);
    }

    public function findActiveByProduct(int $productId): array
    {
        return $this->createQueryBuilder('po')
            ->andWhere('po.product = :productId')
            ->andWhere('po.isActive = true')
            ->setParameter('productId', $productId)
            ->orderBy('po.price', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
