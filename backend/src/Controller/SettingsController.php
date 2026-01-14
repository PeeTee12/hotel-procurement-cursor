<?php

namespace App\Controller;

use App\Entity\Category;
use App\Entity\Organization;
use App\Entity\User;
use App\Repository\BranchRepository;
use App\Repository\CategoryRepository;
use App\Repository\OrganizationRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
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
        private BranchRepository $branchRepository,
        private UserRepository $userRepository,
        private CategoryRepository $categoryRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private ParameterBagInterface $parameterBag,
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

    #[Route('/avatar', name: 'api_settings_avatar_upload', methods: ['POST'])]
    public function uploadAvatar(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }

        $file = $request->files->get('avatar');
        
        if (!$file instanceof UploadedFile) {
            return $this->json(['error' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        }

        // Validate file type
        $allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        $mimeType = $file->getMimeType();
        
        if (!in_array($mimeType, $allowedMimeTypes)) {
            return $this->json(['error' => 'Invalid file type. Only PNG, JPG, and SVG are allowed.'], Response::HTTP_BAD_REQUEST);
        }

        // Validate file size (2MB = 2097152 bytes)
        if ($file->getSize() > 2097152) {
            return $this->json(['error' => 'File size exceeds 2MB limit'], Response::HTTP_BAD_REQUEST);
        }

        // Create uploads directory if it doesn't exist
        $projectDir = $this->parameterBag->get('kernel.project_dir');
        $uploadDir = $projectDir . '/public/uploads/avatars';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $extension = $file->guessExtension() ?: $file->getClientOriginalExtension();
        $filename = 'avatar_' . $user->getId() . '_' . uniqid() . '.' . $extension;
        $filepath = $uploadDir . '/' . $filename;

        try {
            // Delete old avatar if exists
            $oldAvatar = $user->getAvatar();
            if ($oldAvatar && file_exists($projectDir . '/public' . $oldAvatar)) {
                unlink($projectDir . '/public' . $oldAvatar);
            }

            // Move uploaded file
            $file->move($uploadDir, $filename);

            // Save path to database (relative to public directory)
            $avatarPath = '/uploads/avatars/' . $filename;
            $user->setAvatar($avatarPath);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'avatar' => $avatarPath,
            ]);
        } catch (FileException $e) {
            return $this->json(['error' => 'Failed to upload file: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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
    public function updateUserRoles(#[CurrentUser] User $currentUser, int $id, Request $request): JsonResponse
    {
        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $updateUser = $this->userRepository->find($id);

        if (!$updateUser) {
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

        $updateUser->setRoles($roles);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'user' => [
                'id' => $updateUser->getId(),
                'name' => $updateUser->getName(),
                'email' => $updateUser->getEmail(),
                'roles' => $updateUser->getRoles(),
            ],
            'currentUser' => [
                'id' => $currentUser->getId(),
            ]
        ]);
    }

    #[Route('/logo', name: 'api_settings_logo_upload', methods: ['POST'])]
    public function uploadLogo(#[CurrentUser] User $user, Request $request): JsonResponse
    {
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

        $file = $request->files->get('logo');
        
        if (!$file instanceof UploadedFile) {
            return $this->json(['error' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        }

        // Validate file type
        $allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        $mimeType = $file->getMimeType();
        
        if (!in_array($mimeType, $allowedMimeTypes)) {
            return $this->json(['error' => 'Invalid file type. Only PNG, JPG, and SVG are allowed.'], Response::HTTP_BAD_REQUEST);
        }

        // Validate file size (2MB = 2097152 bytes)
        if ($file->getSize() > 2097152) {
            return $this->json(['error' => 'File size exceeds 2MB limit'], Response::HTTP_BAD_REQUEST);
        }

        // Create uploads directory if it doesn't exist
        $projectDir = $this->parameterBag->get('kernel.project_dir');
        $uploadDir = $projectDir . '/public/uploads/logos';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $extension = $file->guessExtension() ?: $file->getClientOriginalExtension();
        $filename = 'logo_' . uniqid() . '.' . $extension;
        $filepath = $uploadDir . '/' . $filename;

        try {
            // Delete old logo if exists
            $oldLogo = $org->getLogo();
            if ($oldLogo && file_exists($projectDir . '/public' . $oldLogo)) {
                unlink($projectDir . '/public' . $oldLogo);
            }

            // Move uploaded file
            $file->move($uploadDir, $filename);

            // Save path to database (relative to public directory)
            $logoPath = '/uploads/logos/' . $filename;
            $org->setLogo($logoPath);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'logo' => $logoPath,
            ]);
        } catch (FileException $e) {
            return $this->json(['error' => 'Failed to upload file: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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

    #[Route('/categories', name: 'api_settings_categories', methods: ['GET'])]
    public function getCategories(): JsonResponse
    {
        $categories = $this->categoryRepository->findRootCategories();
        
        return $this->json([
            'categories' => array_map(fn($cat) => $this->serializeCategory($cat), $categories),
        ]);
    }

    #[Route('/categories', name: 'api_settings_categories_create', methods: ['POST'])]
    public function createCategory(#[CurrentUser] User $user, Request $request): JsonResponse
    {
        if (!in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || empty(trim($data['name']))) {
            return $this->json(['error' => 'Category name is required'], Response::HTTP_BAD_REQUEST);
        }

        $category = new Category();
        $category->setName(trim($data['name']));
        
        if (isset($data['icon'])) {
            $category->setIcon(trim($data['icon']) ?: null);
        }

        if (isset($data['parentId']) && $data['parentId']) {
            $parent = $this->categoryRepository->find($data['parentId']);
            if (!$parent) {
                return $this->json(['error' => 'Parent category not found'], Response::HTTP_NOT_FOUND);
            }
            $category->setParent($parent);
        }

        $this->entityManager->persist($category);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'category' => $this->serializeCategoryFlat($category),
        ], Response::HTTP_CREATED);
    }

    #[Route('/categories/{id}', name: 'api_settings_categories_update', methods: ['PUT'])]
    public function updateCategory(#[CurrentUser] User $user, int $id, Request $request): JsonResponse
    {
        if (!in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $category = $this->categoryRepository->find($id);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            if (empty(trim($data['name']))) {
                return $this->json(['error' => 'Category name cannot be empty'], Response::HTTP_BAD_REQUEST);
            }
            $category->setName(trim($data['name']));
        }

        if (isset($data['icon'])) {
            $category->setIcon(trim($data['icon']) ?: null);
        }

        if (isset($data['parentId'])) {
            if ($data['parentId'] === null || $data['parentId'] === '') {
                $category->setParent(null);
            } else {
                $parent = $this->categoryRepository->find($data['parentId']);
                if (!$parent) {
                    return $this->json(['error' => 'Parent category not found'], Response::HTTP_NOT_FOUND);
                }
                // Prevent setting category as its own parent
                if ($parent->getId() === $category->getId()) {
                    return $this->json(['error' => 'Category cannot be its own parent'], Response::HTTP_BAD_REQUEST);
                }
                // Prevent circular references
                $currentParent = $parent;
                while ($currentParent) {
                    if ($currentParent->getId() === $category->getId()) {
                        return $this->json(['error' => 'Circular reference detected'], Response::HTTP_BAD_REQUEST);
                    }
                    $currentParent = $currentParent->getParent();
                }
                $category->setParent($parent);
            }
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'category' => $this->serializeCategoryFlat($category),
        ]);
    }

    #[Route('/categories/{id}', name: 'api_settings_categories_delete', methods: ['DELETE'])]
    public function deleteCategory(#[CurrentUser] User $user, int $id): JsonResponse
    {
        if (!in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $category = $this->categoryRepository->find($id);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if category has products
        if ($category->getProducts()->count() > 0) {
            return $this->json(['error' => 'Cannot delete category with products'], Response::HTTP_BAD_REQUEST);
        }

        // Check if category has children
        if ($category->getChildren()->count() > 0) {
            return $this->json(['error' => 'Cannot delete category with subcategories'], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->remove($category);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
        ]);
    }

    private function serializeCategory(Category $category): array
    {
        $children = [];
        foreach ($category->getChildren() as $child) {
            $children[] = $this->serializeCategory($child);
        }

        return [
            'id' => $category->getId(),
            'name' => $category->getName(),
            'icon' => $category->getIcon(),
            'parent' => $category->getParent() ? [
                'id' => $category->getParent()->getId(),
                'name' => $category->getParent()->getName(),
            ] : null,
            'children' => $children,
        ];
    }

    private function serializeCategoryFlat(Category $category): array
    {
        return [
            'id' => $category->getId(),
            'name' => $category->getName(),
            'icon' => $category->getIcon(),
            'parent' => $category->getParent() ? [
                'id' => $category->getParent()->getId(),
                'name' => $category->getParent()->getName(),
            ] : null,
        ];
    }
}
