<?php

namespace App\Repository;

use App\Entity\Supplier;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Supplier>
 */
class SupplierRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Supplier::class);
    }

    public function findActive(): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.status = :status')
            ->setParameter('status', Supplier::STATUS_ACTIVE)
            ->orderBy('s.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findWithErrors(): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.status = :status')
            ->setParameter('status', Supplier::STATUS_ERROR)
            ->orderBy('s.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
