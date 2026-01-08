<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;

class AuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    public function onAuthenticationSuccess(Request $request, TokenInterface $token): JsonResponse
    {
        /** @var User $user */
        $user = $token->getUser();

        $organizations = [];
        foreach ($user->getUserOrganizations() as $userOrg) {
            $org = $userOrg->getOrganization();
            $branch = $userOrg->getBranch();
            $organizations[] = [
                'id' => $org->getId(),
                'name' => $org->getName(),
                'role' => $userOrg->getRole(),
                'branch' => $branch ? [
                    'id' => $branch->getId(),
                    'name' => $branch->getName(),
                ] : null,
            ];
        }

        return new JsonResponse([
            'success' => true,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'avatar' => $user->getAvatar(),
                'roles' => $user->getRoles(),
                'organizations' => $organizations,
            ],
        ]);
    }
}
