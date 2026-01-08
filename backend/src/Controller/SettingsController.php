<?php

namespace App\Controller;

use App\Entity\Organization;
use App\Entity\User;
use App\Repository\OrganizationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/settings')]
class SettingsController extends AbstractController
{
    public function __construct(
        private OrganizationRepository $organizationRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    #[Route('/branding', name: 'api_settings_branding', methods: ['GET'])]
    public function getBranding(#[CurrentUser] User $user): JsonResponse
    {
        $userOrg = $user->getUserOrganizations()->first();
        if (!$userOrg) {
            return $this->json(['error' => 'No organization found'], Response::HTTP_NOT_FOUND);
        }

        $org = $userOrg->getOrganization();

        return $this->json([
            'logo' => $org->getLogo(),
            'name' => $org->getName(),
            'primaryColor' => $org->getPrimaryColor() ?? '#2D4739',
            'secondaryColor' => $org->getSecondaryColor() ?? '#C9A227',
            'domain' => $org->getDomain(),
        ]);
    }

    #[Route('/branding', name: 'api_settings_branding_update', methods: ['PUT'])]
    public function updateBranding(#[CurrentUser] User $user, Request $request): JsonResponse
    {
        $userOrg = $user->getUserOrganizations()->first();
        if (!$userOrg) {
            return $this->json(['error' => 'No organization found'], Response::HTTP_NOT_FOUND);
        }

        $org = $userOrg->getOrganization();
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
    public function updateProfile(#[CurrentUser] User $user, Request $request): JsonResponse
    {
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
    public function updatePassword(#[CurrentUser] User $user, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $newPassword = $data['newPassword'] ?? null;
        if (!$newPassword) {
            return $this->json(['error' => 'New password is required'], Response::HTTP_BAD_REQUEST);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        $this->entityManager->flush();

        return $this->json(['success' => true]);
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
