<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api')]
class AuthController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private TokenStorageInterface $tokenStorage,
    ) {
    }

    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        if ($user === null) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid credentials',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'success' => true,
            'user' => $this->serializeUser($user),
        ]);
    }

    #[Route('/users/quick-login/{id}', name: 'api_quick_login', methods: ['POST'])]
    public function quickLogin(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if ($user === null) {
            return $this->json([
                'success' => false,
                'error' => 'User not found',
            ], Response::HTTP_NOT_FOUND);
        }

        // Manually authenticate the user to create a session
        $token = new UsernamePasswordToken(
            $user,
            'api', // Use the firewall name from security.yaml
            $user->getRoles()
        );
        
        $this->tokenStorage->setToken($token);
        
        // Ensure session is started and save the token
        $session = $request->getSession();
        $session->start();
        $session->set('_security_api', serialize($token));
        $session->save();

        return $this->json([
            'success' => true,
            'user' => $this->serializeUser($user),
        ]);
    }

    #[Route('/users/available', name: 'api_users_available', methods: ['GET'])]
    public function availableUsers(): JsonResponse
    {
        $users = $this->userRepository->findAll();

        $data = array_map(fn(User $user) => [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'avatar' => $user->getAvatar(),
            'roles' => $user->getRoles(),
        ], $users);

        return $this->json($data);
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?User $user): JsonResponse
    {
        if ($user === null) {
            return $this->json([
                'success' => false,
                'error' => 'Not authenticated',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'success' => true,
            'user' => $this->serializeUser($user),
        ]);
    }

    #[Route('/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        return $this->json(['success' => true]);
    }

    private function serializeUser(User $user): array
    {
        $organizations = [];
        foreach ($user->getUserOrganizations() as $userOrg) {
            $org = $userOrg->getOrganization();
            $branch = $userOrg->getBranch();
            $organizations[] = [
                'id' => $org->getId(),
                'name' => $org->getName(),
                'role' => $userOrg->getRole(),
                'primaryColor' => $org->getPrimaryColor(),
                'secondaryColor' => $org->getSecondaryColor(),
                'branch' => $branch ? [
                    'id' => $branch->getId(),
                    'name' => $branch->getName(),
                ] : null,
            ];
        }

        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'avatar' => $user->getAvatar(),
            'roles' => $user->getRoles(),
            'organizations' => $organizations,
        ];
    }
}
