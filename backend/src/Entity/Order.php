<?php

namespace App\Entity;

use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: 'orders')]
class Order
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_ORDERED = 'ordered';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';

    public const PRIORITY_LOW = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH = 'high';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['order:read', 'order:list'])]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['order:read', 'order:list'])]
    private ?string $orderNumber = null;

    #[ORM\ManyToOne(inversedBy: 'orders')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['order:read', 'order:list'])]
    private ?Branch $branch = null;

    #[ORM\ManyToOne(inversedBy: 'orders')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['order:read', 'order:list'])]
    private ?User $createdBy = null;

    #[ORM\Column(length: 50)]
    #[Groups(['order:read', 'order:list'])]
    private string $status = self::STATUS_DRAFT;

    #[ORM\Column(length: 20)]
    #[Groups(['order:read', 'order:list'])]
    private string $priority = self::PRIORITY_MEDIUM;

    #[ORM\Column(type: Types::DECIMAL, precision: 12, scale: 2)]
    #[Groups(['order:read', 'order:list'])]
    private string $totalAmount = '0.00';

    #[ORM\Column(length: 3)]
    #[Groups(['order:read', 'order:list'])]
    private string $currency = 'CZK';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['order:read'])]
    private ?string $note = null;

    #[ORM\OneToMany(targetEntity: OrderItem::class, mappedBy: 'order', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['order:read'])]
    private Collection $items;

    #[ORM\Column]
    #[Groups(['order:read', 'order:list'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['order:read', 'order:list'])]
    private ?\DateTimeImmutable $submittedAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['order:read'])]
    private ?\DateTimeImmutable $approvedAt = null;

    #[ORM\ManyToOne]
    #[Groups(['order:read'])]
    private ?User $approvedBy = null;

    public function __construct()
    {
        $this->items = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOrderNumber(): ?string
    {
        return $this->orderNumber;
    }

    public function setOrderNumber(string $orderNumber): static
    {
        $this->orderNumber = $orderNumber;
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

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;
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

    public function getPriority(): string
    {
        return $this->priority;
    }

    public function setPriority(string $priority): static
    {
        $this->priority = $priority;
        return $this;
    }

    public function getTotalAmount(): string
    {
        return $this->totalAmount;
    }

    public function setTotalAmount(string $totalAmount): static
    {
        $this->totalAmount = $totalAmount;
        return $this;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): static
    {
        $this->currency = $currency;
        return $this;
    }

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function setNote(?string $note): static
    {
        $this->note = $note;
        return $this;
    }

    /**
     * @return Collection<int, OrderItem>
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(OrderItem $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setOrder($this);
        }
        return $this;
    }

    public function removeItem(OrderItem $item): static
    {
        if ($this->items->removeElement($item)) {
            if ($item->getOrder() === $this) {
                $item->setOrder(null);
            }
        }
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

    public function getSubmittedAt(): ?\DateTimeImmutable
    {
        return $this->submittedAt;
    }

    public function setSubmittedAt(?\DateTimeImmutable $submittedAt): static
    {
        $this->submittedAt = $submittedAt;
        return $this;
    }

    public function getApprovedAt(): ?\DateTimeImmutable
    {
        return $this->approvedAt;
    }

    public function setApprovedAt(?\DateTimeImmutable $approvedAt): static
    {
        $this->approvedAt = $approvedAt;
        return $this;
    }

    public function getApprovedBy(): ?User
    {
        return $this->approvedBy;
    }

    public function setApprovedBy(?User $approvedBy): static
    {
        $this->approvedBy = $approvedBy;
        return $this;
    }

    public function recalculateTotal(): void
    {
        $total = '0.00';
        foreach ($this->items as $item) {
            $total = bcadd($total, $item->getTotalPrice(), 2);
        }
        $this->totalAmount = $total;
    }

    public function getItemCount(): int
    {
        return $this->items->count();
    }
}
