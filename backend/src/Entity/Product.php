<?php

namespace App\Entity;

use App\Repository\ProductRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\Table(name: 'products')]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['product:read', 'order:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['product:read', 'order:read'])]
    private ?string $name = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['product:read'])]
    private ?string $description = null;

    #[ORM\Column(length: 50)]
    #[Groups(['product:read', 'order:read'])]
    private ?string $unit = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['product:read'])]
    private ?string $image = null;

    #[ORM\ManyToOne(inversedBy: 'products')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['product:read'])]
    private ?Category $category = null;

    #[ORM\OneToMany(targetEntity: ProductOffer::class, mappedBy: 'product')]
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getUnit(): ?string
    {
        return $this->unit;
    }

    public function setUnit(string $unit): static
    {
        $this->unit = $unit;
        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image;
        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;
        return $this;
    }

    /**
     * @return Collection<int, ProductOffer>
     */
    public function getProductOffers(): Collection
    {
        return $this->productOffers;
    }

    public function addProductOffer(ProductOffer $productOffer): static
    {
        if (!$this->productOffers->contains($productOffer)) {
            $this->productOffers->add($productOffer);
            $productOffer->setProduct($this);
        }
        return $this;
    }

    public function removeProductOffer(ProductOffer $productOffer): static
    {
        if ($this->productOffers->removeElement($productOffer)) {
            if ($productOffer->getProduct() === $this) {
                $productOffer->setProduct(null);
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
