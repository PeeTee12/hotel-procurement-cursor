<?php

namespace App\Repository;

use App\Entity\Branch;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Branch>
 */
class BranchRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Branch::class);
    }

    public function findByOrganization(int $organizationId): array
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.organization = :orgId')
            ->setParameter('orgId', $organizationId)
            ->orderBy('b.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
