<?php

namespace App\Repository;

use App\Entity\UserOrganization;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserOrganization>
 */
class UserOrganizationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserOrganization::class);
    }

    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('uo')
            ->andWhere('uo.user = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult();
    }
}
