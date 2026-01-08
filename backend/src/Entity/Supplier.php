<?php

namespace App\Entity;

use App\Repository\SupplierRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: SupplierRepository::class)]
#[ORM\Table(name: 'suppliers')]
class Supplier
{
    public const STATUS_ACTIVE = 'active';
    public const STATUS_ERROR = 'error';
    public const STATUS_SYNCING = 'syncing';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['supplier:read', 'product:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['supplier:read', 'product:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['supplier:read'])]
    private ?string $category = null;

    #[ORM\Column]
    #[Groups(['supplier:read'])]
    private int $productCount = 0;

    #[ORM\Column]
    #[Groups(['supplier:read'])]
    private int $ordersPerMonth = 0;

    #[ORM\Column(length: 50)]
    #[Groups(['supplier:read'])]
    private string $status = self::STATUS_ACTIVE;

    #[ORM\Column(nullable: true)]
    #[Groups(['supplier:read'])]
    private ?\DateTimeImmutable $lastSyncAt = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['supplier:read'])]
    private ?string $apiEndpoint = null;

    #[ORM\OneToMany(targetEntity: ProductOffer::class, mappedBy: 'supplier')]
    private Collection $productOffers;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->productOffers = new ArrayCollection();
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

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(?string $category): static
    {
        $this->category = $category;
        return $this;
    }

    public function getProductCount(): int
    {
        return $this->productCount;
    }

    public function setProductCount(int $productCount): static
    {
        $this->productCount = $productCount;
        return $this;
    }

    public function getOrdersPerMonth(): int
    {
        return $this->ordersPerMonth;
    }

    public function setOrdersPerMonth(int $ordersPerMonth): static
    {
        $this->ordersPerMonth = $ordersPerMonth;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getLastSyncAt(): ?\DateTimeImmutable
    {
        return $this->lastSyncAt;
    }

    public function setLastSyncAt(?\DateTimeImmutable $lastSyncAt): static
    {
        $this->lastSyncAt = $lastSyncAt;
        return $this;
    }

    public function getApiEndpoint(): ?string
    {
        return $this->apiEndpoint;
    }

    public function setApiEndpoint(?string $apiEndpoint): static
    {
        $this->apiEndpoint = $apiEndpoint;
        return $this;
    }

    /**
     * @return Collection<int, ProductOffer>
     */
    public function getProductOffers(): Collection
    {
        return $this->productOffers;
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
