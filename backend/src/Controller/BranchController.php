<?php

namespace App\Controller;

use App\Entity\Branch;
use App\Entity\User;
use App\Repository\BranchRepository;
use App\Repository\OrganizationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/branches')]
class BranchController extends AbstractController
{
    public function __construct(
        private BranchRepository $branchRepository,
        private OrganizationRepository $organizationRepository,
        private EntityManagerInterface $entityManager,
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

    #[Route('', name: 'api_branches_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        // Get user's organization
        $organization = null;
        if ($user instanceof User) {
            $userOrg = $user->getUserOrganizations()->first();
            if ($userOrg) {
                $organization = $userOrg->getOrganization();
            }
        }
        
        if (!$organization) {
            $organization = $this->organizationRepository->findOneBy([]);
        }

        if (!$organization) {
            return $this->json(['error' => 'No organization found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $name = $data['name'] ?? null;
        $address = $data['address'] ?? null;

        if (!$name) {
            return $this->json(['error' => 'Name is required'], Response::HTTP_BAD_REQUEST);
        }

        $branch = new Branch();
        $branch->setName($name);
        $branch->setAddress($address);
        $branch->setOrganization($organization);

        $this->entityManager->persist($branch);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'branch' => [
                'id' => $branch->getId(),
                'name' => $branch->getName(),
                'address' => $branch->getAddress(),
                'organization' => [
                    'id' => $organization->getId(),
                    'name' => $organization->getName(),
                ],
            ],
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_branches_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $branch = $this->branchRepository->find($id);
        if (!$branch) {
            return $this->json(['error' => 'Branch not found'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        
        // Check if user has access to this branch's organization
        if ($user instanceof User) {
            $userOrg = $user->getUserOrganizations()->first();
            if ($userOrg && $userOrg->getOrganization()->getId() !== $branch->getOrganization()->getId()) {
                return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
            }
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $branch->setName($data['name']);
        }
        if (isset($data['address'])) {
            $branch->setAddress($data['address']);
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'branch' => [
                'id' => $branch->getId(),
                'name' => $branch->getName(),
                'address' => $branch->getAddress(),
                'organization' => [
                    'id' => $branch->getOrganization()->getId(),
                    'name' => $branch->getOrganization()->getName(),
                ],
            ],
        ]);
    }
}
