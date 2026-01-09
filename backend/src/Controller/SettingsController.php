<?php

namespace App\Controller;

use App\Entity\Organization;
use App\Entity\User;
use App\Repository\BranchRepository;
use App\Repository\OrganizationRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/settings')]
class SettingsController extends AbstractController
{
    public function __construct(
        private OrganizationRepository $organizationRepository,
        private BranchRepository $branchRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    #[Route('/branding', name: 'api_settings_branding', methods: ['GET'])]
    public function getBranding(): JsonResponse
    {
        $user = $this->getUser();
        
        // If user is logged in, use their organization, otherwise use first organization
        if ($user instanceof User) {
            $userOrg = $user->getUserOrganizations()->first();
            if ($userOrg) {
                $org = $userOrg->getOrganization();
            } else {
                $org = $this->organizationRepository->findOneBy([]);
            }
        } else {
            $org = $this->organizationRepository->findOneBy([]);
        }

        if (!$org) {
            return $this->json(['error' => 'No organization found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'logo' => $org->getLogo(),
            'name' => $org->getName(),
            'primaryColor' => $org->getPrimaryColor() ?? '#2D4739',
            'secondaryColor' => $org->getSecondaryColor() ?? '#C9A227',
            'domain' => $org->getDomain(),
        ]);
    }

    #[Route('/branding', name: 'api_settings_branding_update', methods: ['PUT'])]
    public function updateBranding(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        // If user is logged in, use their organization, otherwise use first organization
        if ($user instanceof User) {
            $userOrg = $user->getUserOrganizations()->first();
            if ($userOrg) {
                $org = $userOrg->getOrganization();
            } else {
                $org = $this->organizationRepository->findOneBy([]);
            }
        } else {
            $org = $this->organizationRepository->findOneBy([]);
        }

        if (!$org) {
            return $this->json(['error' => 'No organization found'], Response::HTTP_NOT_FOUND);
        }
        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $org->setName($data['name']);
        }
        if (isset($data['primaryColor'])) {
            $org->setPrimaryColor($data['primaryColor']);
        }
        if (isset($data['secondaryColor'])) {
            $org->setSecondaryColor($data['secondaryColor']);
        }
        if (isset($data['domain'])) {
            $org->setDomain($data['domain']);
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'branding' => [
                'logo' => $org->getLogo(),
                'name' => $org->getName(),
                'primaryColor' => $org->getPrimaryColor(),
                'secondaryColor' => $org->getSecondaryColor(),
                'domain' => $org->getDomain(),
            ],
        ]);
    }

    #[Route('/profile', name: 'api_settings_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $user->setName($data['name']);
        }
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }
        if (isset($data['avatar'])) {
            $user->setAvatar($data['avatar']);
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'avatar' => $user->getAvatar(),
            ],
        ]);
    }

    #[Route('/password', name: 'api_settings_password', methods: ['PUT'])]
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        $currentPassword = $data['currentPassword'] ?? null;
        $newPassword = $data['newPassword'] ?? null;

        if (!$currentPassword) {
            return $this->json(['error' => 'Current password is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!$newPassword) {
            return $this->json(['error' => 'New password is required'], Response::HTTP_BAD_REQUEST);
        }

        // Verify current password
        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            return $this->json(['error' => 'Current password is incorrect'], Response::HTTP_BAD_REQUEST);
        }

        // Update password
        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        $this->entityManager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/organization', name: 'api_settings_organization', methods: ['GET'])]
    public function getOrganization(): JsonResponse
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

        // Get branches for this organization
        $branches = $this->branchRepository->findByOrganization($organization->getId());

        return $this->json([
            'organization' => [
                'id' => $organization->getId(),
                'name' => $organization->getName(),
                'logo' => $organization->getLogo(),
                'domain' => $organization->getDomain(),
                'primaryColor' => $organization->getPrimaryColor(),
                'secondaryColor' => $organization->getSecondaryColor(),
                'createdAt' => $organization->getCreatedAt()->format('Y-m-d H:i:s'),
            ],
            'branches' => array_map(fn($branch) => [
                'id' => $branch->getId(),
                'name' => $branch->getName(),
                'address' => $branch->getAddress(),
                'createdAt' => $branch->getCreatedAt()->format('Y-m-d H:i:s'),
            ], $branches),
        ]);
    }

    #[Route('/users', name: 'api_settings_users', methods: ['GET'])]
    public function getUsers(): JsonResponse
    {
        // Allow access even without authentication for demo purposes
        // If user is logged in and is not admin, they can still see users (for demo)
        $users = $this->userRepository->findAll();

        return $this->json([
            'users' => array_map(fn($user) => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'avatar' => $user->getAvatar(),
                'roles' => $user->getRoles(),
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
            ], $users),
        ]);
    }

    #[Route('/users/{id}/roles', name: 'api_settings_users_update_roles', methods: ['PUT'])]
    public function updateUserRoles(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $roles = $data['roles'] ?? null;

        if (!is_array($roles)) {
            return $this->json(['error' => 'Roles must be an array'], Response::HTTP_BAD_REQUEST);
        }

        // Filter out ROLE_USER as it's automatically added
        $roles = array_filter($roles, fn($role) => $role !== 'ROLE_USER');
        $roles = array_values($roles); // Re-index array

        $user->setRoles($roles);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ],
        ]);
    }

    #[Route('/color-schemes', name: 'api_settings_color_schemes', methods: ['GET'])]
    public function colorSchemes(): JsonResponse
    {
        return $this->json([
            'schemes' => [
                [
                    'id' => 'orea-original',
                    'name' => 'Orea Original',
                    'primary' => '#2D4739',
                    'secondary' => '#C9A227',
                ],
                [
                    'id' => 'ocean-blue',
                    'name' => 'Ocean Blue',
                    'primary' => '#1E40AF',
                    'secondary' => '#A78BFA',
                ],
                [
                    'id' => 'royal-purple',
                    'name' => 'Royal Purple',
                    'primary' => '#7C3AED',
                    'secondary' => '#F472B6',
                ],
                [
                    'id' => 'warm-terra',
                    'name' => 'Warm Terra',
                    'primary' => '#B45309',
                    'secondary' => '#FBBF24',
                ],
                [
                    'id' => 'modern-gray',
                    'name' => 'Modern Gray',
                    'primary' => '#374151',
                    'secondary' => '#F59E0B',
                ],
                [
                    'id' => 'fresh-mint',
                    'name' => 'Fresh Mint',
                    'primary' => '#059669',
                    'secondary' => '#FBBF24',
                ],
            ],
        ]);
    }
}
