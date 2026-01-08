<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'order:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Groups(['user:read', 'order:read'])]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'order:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $avatar = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\OneToMany(targetEntity: UserOrganization::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $userOrganizations;

    #[ORM\OneToMany(targetEntity: Order::class, mappedBy: 'createdBy')]
    private Collection $orders;

    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->userOrganizations = new ArrayCollection();
        $this->orders = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): static
    {
        $this->avatar = $avatar;
        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
    }

    /**
     * @return Collection<int, UserOrganization>
     */
    public function getUserOrganizations(): Collection
    {
        return $this->userOrganizations;
    }

    public function addUserOrganization(UserOrganization $userOrganization): static
    {
        if (!$this->userOrganizations->contains($userOrganization)) {
            $this->userOrganizations->add($userOrganization);
            $userOrganization->setUser($this);
        }
        return $this;
    }

    public function removeUserOrganization(UserOrganization $userOrganization): static
    {
        if ($this->userOrganizations->removeElement($userOrganization)) {
            if ($userOrganization->getUser() === $this) {
                $userOrganization->setUser(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Order>
     */
    public function getOrders(): Collection
    {
        return $this->orders;
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
