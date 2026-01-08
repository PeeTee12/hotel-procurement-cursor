<?php

namespace App\Repository;

use App\Entity\Order;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Order>
 */
class OrderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Order::class);
    }

    public function findByUser(int $userId, ?string $status = null): array
    {
        $qb = $this->createQueryBuilder('o')
            ->leftJoin('o.branch', 'b')
            ->leftJoin('o.createdBy', 'u')
            ->leftJoin('o.items', 'i')
            ->addSelect('b', 'u', 'i')
            ->andWhere('o.createdBy = :userId')
            ->setParameter('userId', $userId);

        if ($status !== null) {
            $qb->andWhere('o.status = :status')
                ->setParameter('status', $status);
        }

        return $qb->orderBy('o.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findPendingApproval(?int $organizationId = null): array
    {
        $qb = $this->createQueryBuilder('o')
            ->leftJoin('o.branch', 'b')
            ->leftJoin('b.organization', 'org')
            ->leftJoin('o.createdBy', 'u')
            ->leftJoin('o.items', 'i')
            ->addSelect('b', 'org', 'u', 'i')
            ->andWhere('o.status = :status')
            ->setParameter('status', Order::STATUS_SUBMITTED);

        if ($organizationId !== null) {
            $qb->andWhere('org.id = :orgId')
                ->setParameter('orgId', $organizationId);
        }

        return $qb->orderBy('o.priority', 'DESC')
            ->addOrderBy('o.submittedAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findRecent(int $limit = 10): array
    {
        return $this->createQueryBuilder('o')
            ->leftJoin('o.branch', 'b')
            ->leftJoin('o.createdBy', 'u')
            ->addSelect('b', 'u')
            ->orderBy('o.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countByStatus(): array
    {
        return $this->createQueryBuilder('o')
            ->select('o.status, COUNT(o.id) as count')
            ->groupBy('o.status')
            ->getQuery()
            ->getResult();
    }

    public function getTotalAmount(): string
    {
        $result = $this->createQueryBuilder('o')
            ->select('SUM(o.totalAmount) as total')
            ->getQuery()
            ->getSingleScalarResult();

        return $result ?? '0.00';
    }

    public function generateOrderNumber(): string
    {
        $year = date('Y');
        $lastOrder = $this->createQueryBuilder('o')
            ->andWhere('o.orderNumber LIKE :prefix')
            ->setParameter('prefix', "OBJ-{$year}-%")
            ->orderBy('o.id', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if ($lastOrder) {
            $parts = explode('-', $lastOrder->getOrderNumber());
            $number = (int) end($parts) + 1;
        } else {
            $number = 1;
        }

        return sprintf('OBJ-%s-%03d', $year, $number);
    }
}
