<?php

namespace App\Entity;

use App\Repository\ProductOfferRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ProductOfferRepository::class)]
#[ORM\Table(name: 'product_offers')]
class ProductOffer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['product:read', 'order:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'productOffers')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['product:read'])]
    private ?Product $product = null;

    #[ORM\ManyToOne(inversedBy: 'productOffers')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['product:read'])]
    private ?Supplier $supplier = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['product:read', 'order:read'])]
    private ?string $price = null;

    #[ORM\Column(length: 3)]
    #[Groups(['product:read', 'order:read'])]
    private string $currency = 'CZK';

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['product:read'])]
    private ?string $sku = null;

    #[ORM\Column]
    #[Groups(['product:read'])]
    private bool $isActive = true;

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

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function setProduct(?Product $product): static
    {
        $this->product = $product;
        return $this;
    }

    public function getSupplier(): ?Supplier
    {
        return $this->supplier;
    }

    public function setSupplier(?Supplier $supplier): static
    {
        $this->supplier = $supplier;
        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(string $price): static
    {
        $this->price = $price;
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

    public function getSku(): ?string
    {
        return $this->sku;
    }

    public function setSku(?string $sku): static
    {
        $this->sku = $sku;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;
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
