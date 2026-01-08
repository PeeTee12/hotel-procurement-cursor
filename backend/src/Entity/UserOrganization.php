<?php

namespace App\Entity;

use App\Repository\UserOrganizationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserOrganizationRepository::class)]
#[ORM\Table(name: 'user_organizations')]
class UserOrganization
{
    public const ROLE_ADMIN = 'admin';
    public const ROLE_PURCHASE_MANAGER = 'purchase_manager';
    public const ROLE_BRANCH_MANAGER = 'branch_manager';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'userOrganizations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'userOrganizations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user:read'])]
    private ?Organization $organization = null;

    #[ORM\ManyToOne]
    #[Groups(['user:read'])]
    private ?Branch $branch = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read'])]
    private ?string $role = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getOrganization(): ?Organization
    {
        return $this->organization;
    }

    public function setOrganization(?Organization $organization): static
    {
        $this->organization = $organization;
        return $this;
    }

    public function getBranch(): ?Branch
    {
        return $this->branch;
    }

    public function setBranch(?Branch $branch): static
    {
        $this->branch = $branch;
        return $this;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}
