<?php

namespace App\Entity;

use App\Repository\BranchRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: BranchRepository::class)]
#[ORM\Table(name: 'branches')]
class Branch
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['branch:read', 'order:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['branch:read', 'order:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['branch:read'])]
    private ?string $address = null;

    #[ORM\ManyToOne(inversedBy: 'branches')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['branch:read'])]
    private ?Organization $organization = null;

    #[ORM\OneToMany(targetEntity: Order::class, mappedBy: 'branch')]
    private Collection $orders;

    #[ORM\Column]
    #[Groups(['branch:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->orders = new ArrayCollection();
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

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;
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

    /**
     * @return Collection<int, Order>
     */
    public function getOrders(): Collection
    {
        return $this->orders;
    }

    public function addOrder(Order $order): static
    {
        if (!$this->orders->contains($order)) {
            $this->orders->add($order);
            $order->setBranch($this);
        }
        return $this;
    }

    public function removeOrder(Order $order): static
    {
        if ($this->orders->removeElement($order)) {
            if ($order->getBranch() === $this) {
                $order->setBranch(null);
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
}
