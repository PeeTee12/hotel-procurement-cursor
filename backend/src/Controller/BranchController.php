<?php

namespace App\Controller;

use App\Repository\BranchRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/branches')]
class BranchController extends AbstractController
{
    public function __construct(
        private BranchRepository $branchRepository,
    ) {
    }

    #[Route('', name: 'api_branches', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $branches = $this->branchRepository->findAll();

        return $this->json([
            'branches' => array_map(fn($branch) => [
                'id' => $branch->getId(),
                'name' => $branch->getName(),
                'address' => $branch->getAddress(),
                'organization' => [
                    'id' => $branch->getOrganization()->getId(),
                    'name' => $branch->getOrganization()->getName(),
                ],
            ], $branches),
        ]);
    }
}
