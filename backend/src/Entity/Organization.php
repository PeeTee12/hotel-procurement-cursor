<?php

namespace App\Entity;

use App\Repository\OrganizationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: OrganizationRepository::class)]
#[ORM\Table(name: 'organizations')]
class Organization
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['organization:read', 'branch:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['organization:read', 'branch:read', 'user:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['organization:read'])]
    private ?string $logo = null;

    #[ORM\Column(length: 7, nullable: true)]
    #[Groups(['organization:read'])]
    private ?string $primaryColor = null;

    #[ORM\Column(length: 7, nullable: true)]
    #[Groups(['organization:read'])]
    private ?string $secondaryColor = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['organization:read'])]
    private ?string $domain = null;

    #[ORM\Column]
    #[Groups(['organization:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\OneToMany(targetEntity: Branch::class, mappedBy: 'organization')]
    private Collection $branches;

    #[ORM\OneToMany(targetEntity: UserOrganization::class, mappedBy: 'organization')]
    private Collection $userOrganizations;

    public function __construct()
    {
        $this->branches = new ArrayCollection();
        $this->userOrganizations = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getLogo(): ?string
    {
        return $this->logo;
    }

    public function setLogo(?string $logo): static
    {
        $this->logo = $logo;
        return $this;
    }

    public function getPrimaryColor(): ?string
    {
        return $this->primaryColor;
    }

    public function setPrimaryColor(?string $primaryColor): static
    {
        $this->primaryColor = $primaryColor;
        return $this;
    }

    public function getSecondaryColor(): ?string
    {
        return $this->secondaryColor;
    }

    public function setSecondaryColor(?string $secondaryColor): static
    {
        $this->secondaryColor = $secondaryColor;
        return $this;
    }

    public function getDomain(): ?string
    {
        return $this->domain;
    }

    public function setDomain(?string $domain): static
    {
        $this->domain = $domain;
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

    /**
     * @return Collection<int, Branch>
     */
    public function getBranches(): Collection
    {
        return $this->branches;
    }

    public function addBranch(Branch $branch): static
    {
        if (!$this->branches->contains($branch)) {
            $this->branches->add($branch);
            $branch->setOrganization($this);
        }
        return $this;
    }

    public function removeBranch(Branch $branch): static
    {
        if ($this->branches->removeElement($branch)) {
            if ($branch->getOrganization() === $this) {
                $branch->setOrganization(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, UserOrganization>
     */
    public function getUserOrganizations(): Collection
    {
        return $this->userOrganizations;
    }
}
