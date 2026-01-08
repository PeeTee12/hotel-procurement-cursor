<?php

namespace App\DataFixtures;

use App\Entity\Branch;
use App\Entity\Category;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Organization;
use App\Entity\Product;
use App\Entity\ProductOffer;
use App\Entity\Supplier;
use App\Entity\User;
use App\Entity\UserOrganization;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // Create Organization
        $org = new Organization();
        $org->setName('OREA Hotels');
        $org->setPrimaryColor('#2D4739');
        $org->setSecondaryColor('#C9A227');
        $org->setDomain('procure.orea.cz');
        $manager->persist($org);

        // Create Branches
        $branches = [];
        $branchNames = [
            'OREA Hotel Pyramida',
            'OREA Hotel Voroněž',
            'OREA Resort Devět Skal',
        ];

        foreach ($branchNames as $name) {
            $branch = new Branch();
            $branch->setName($name);
            $branch->setOrganization($org);
            $branch->setAddress('Praha, Česká republika');
            $manager->persist($branch);
            $branches[] = $branch;
        }

        // Create Users
        $admin = new User();
        $admin->setName('Lukáš Malík');
        $admin->setEmail('admin@orea.cz');
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'password'));
        $admin->setRoles(['ROLE_ADMIN']);
        $manager->persist($admin);

        $adminOrg = new UserOrganization();
        $adminOrg->setUser($admin);
        $adminOrg->setOrganization($org);
        $adminOrg->setRole(UserOrganization::ROLE_ADMIN);
        $manager->persist($adminOrg);

        $purchaseManager = new User();
        $purchaseManager->setName('Jan Novák');
        $purchaseManager->setEmail('jan.novak@orea.cz');
        $purchaseManager->setPassword($this->passwordHasher->hashPassword($purchaseManager, 'password'));
        $purchaseManager->setRoles(['ROLE_USER']);
        $manager->persist($purchaseManager);

        $pmOrg = new UserOrganization();
        $pmOrg->setUser($purchaseManager);
        $pmOrg->setOrganization($org);
        $pmOrg->setBranch($branches[0]);
        $pmOrg->setRole(UserOrganization::ROLE_PURCHASE_MANAGER);
        $manager->persist($pmOrg);

        $branchManager = new User();
        $branchManager->setName('Marie Svobodová');
        $branchManager->setEmail('marie.svobodova@orea.cz');
        $branchManager->setPassword($this->passwordHasher->hashPassword($branchManager, 'password'));
        $branchManager->setRoles(['ROLE_USER']);
        $manager->persist($branchManager);

        $bmOrg = new UserOrganization();
        $bmOrg->setUser($branchManager);
        $bmOrg->setOrganization($org);
        $bmOrg->setBranch($branches[1]);
        $bmOrg->setRole(UserOrganization::ROLE_BRANCH_MANAGER);
        $manager->persist($bmOrg);

        // Create Suppliers
        $suppliers = [];
        $supplierData = [
            ['Fresh Foods s.r.o.', 'Potraviny & Nápoje', 1247, 156, Supplier::STATUS_ACTIVE],
            ['Premium Meats a.s.', 'Maso & Uzeniny', 342, 89, Supplier::STATUS_ACTIVE],
            ['Ocean Delights', 'Ryby & Mořské plody', 198, 45, Supplier::STATUS_SYNCING],
            ['Vinařství Moravíno', 'Víno & Alkohol', 523, 67, Supplier::STATUS_ACTIVE],
            ['Bio Farm Česká', 'Bio produkty', 156, 23, Supplier::STATUS_ERROR],
            ['Dairy Premium CZ', 'Mléčné výrobky', 287, 112, Supplier::STATUS_ACTIVE],
        ];

        foreach ($supplierData as [$name, $category, $productCount, $ordersPerMonth, $status]) {
            $supplier = new Supplier();
            $supplier->setName($name);
            $supplier->setCategory($category);
            $supplier->setProductCount($productCount);
            $supplier->setOrdersPerMonth($ordersPerMonth);
            $supplier->setStatus($status);
            $supplier->setLastSyncAt(new \DateTimeImmutable('-' . rand(1, 60) . ' minutes'));
            $manager->persist($supplier);
            $suppliers[] = $supplier;
        }

        // Create Categories
        $categories = [];
        $categoryNames = ['Maso', 'Zelenina', 'Mléčné výrobky', 'Pečivo', 'Nápoje'];
        foreach ($categoryNames as $name) {
            $category = new Category();
            $category->setName($name);
            $category->setIcon('box');
            $manager->persist($category);
            $categories[$name] = $category;
        }

        // Create subcategories
        $subcategories = [
            'Maso' => ['Hovězí', 'Vepřové', 'Drůbež'],
            'Mléčné výrobky' => ['Jogurty', 'Sýry', 'Mléko'],
            'Nápoje' => ['Alkoholické', 'Nealkoholické', 'Káva & Čaj'],
            'Pečivo' => ['Chléb', 'Rohlíky', 'Sladké'],
        ];

        foreach ($subcategories as $parentName => $children) {
            foreach ($children as $childName) {
                $child = new Category();
                $child->setName($childName);
                $child->setParent($categories[$parentName]);
                $manager->persist($child);
                $categories[$childName] = $child;
            }
        }

        // Create Products
        $products = [];
        $productData = [
            ['Bílé víno', 'Moravské bílé víno 0.75l', 'ks', 'Alkoholické', 149.9],
            ['Bílý jogurt', 'Bílý jogurt 3% tuku', 'ks', 'Jogurty', 19.9],
            ['Celer', 'Bulvový celer', 'kg', 'Zelenina', 39.9],
            ['Celozrnný chléb', 'Celozrnný žitný chléb', 'ks', 'Chléb', 45.0],
            ['Croissant', 'Máslový croissant', 'ks', 'Sladké', 29.9],
            ['Eidam 30%', 'Eidam plátky 30% tuku', 'bal', 'Sýry', 89.9],
            ['Hovězí svíčková', 'Hovězí svíčková čerstvá', 'kg', 'Hovězí', 399.0],
            ['Kuřecí prsa', 'Kuřecí prsa bez kosti', 'kg', 'Drůbež', 189.0],
            ['Mléko plnotučné', 'Mléko 3.5% 1l', 'ks', 'Mléko', 29.9],
            ['Pomerančový džus', 'Pomerančový džus 100% 1l', 'ks', 'Nealkoholické', 49.9],
            ['Rajčata', 'Rajčata cherry', 'kg', 'Zelenina', 79.9],
            ['Rohlík', 'Rohlík klasický', 'ks', 'Rohlíky', 3.5],
            ['Vepřová kýta', 'Vepřová kýta bez kosti', 'kg', 'Vepřové', 159.0],
            ['Zrnková káva', 'Zrnková káva Arabica 1kg', 'ks', 'Káva & Čaj', 449.0],
        ];

        foreach ($productData as [$name, $description, $unit, $categoryName, $price]) {
            $product = new Product();
            $product->setName($name);
            $product->setDescription($description);
            $product->setUnit($unit);
            $product->setCategory($categories[$categoryName] ?? $categories['Maso']);
            $manager->persist($product);

            // Create offer for each product
            $offer = new ProductOffer();
            $offer->setProduct($product);
            $offer->setSupplier($suppliers[array_rand($suppliers)]);
            $offer->setPrice((string) $price);
            $offer->setCurrency('CZK');
            $offer->setIsActive(true);
            $manager->persist($offer);

            $products[] = ['product' => $product, 'offer' => $offer];
        }

        $manager->flush();

        // Create Orders
        $orderData = [
            ['OBJ-2024-001', Order::STATUS_SUBMITTED, Order::PRIORITY_MEDIUM, $branches[0], $purchaseManager, '4028.00', 3],
            ['OBJ-2024-002', Order::STATUS_APPROVED, Order::PRIORITY_MEDIUM, $branches[0], $purchaseManager, '2602.00', 2],
            ['OBJ-2024-003', Order::STATUS_DELIVERED, Order::PRIORITY_LOW, $branches[1], $branchManager, '1780.00', 1],
            ['OBJ-2024-004', Order::STATUS_REJECTED, Order::PRIORITY_HIGH, $branches[2], $purchaseManager, '3600.00', 2],
            ['OBJ-2024-005', Order::STATUS_ORDERED, Order::PRIORITY_MEDIUM, $branches[0], $purchaseManager, '640.00', 1],
        ];

        foreach ($orderData as $i => [$orderNumber, $status, $priority, $branch, $user, $total, $itemCount]) {
            $order = new Order();
            $order->setOrderNumber($orderNumber);
            $order->setStatus($status);
            $order->setPriority($priority);
            $order->setBranch($branch);
            $order->setCreatedBy($user);
            $order->setTotalAmount($total);
            $order->setCreatedAt(new \DateTimeImmutable('-' . (5 - $i) . ' days'));

            if ($status !== Order::STATUS_DRAFT) {
                $order->setSubmittedAt(new \DateTimeImmutable('-' . (5 - $i) . ' days + 1 hour'));
            }

            if ($status === Order::STATUS_APPROVED || $status === Order::STATUS_DELIVERED || $status === Order::STATUS_ORDERED) {
                $order->setApprovedAt(new \DateTimeImmutable('-' . (5 - $i) . ' days + 2 hours'));
                $order->setApprovedBy($admin);
            }

            // Add items
            for ($j = 0; $j < $itemCount; $j++) {
                $productData = $products[array_rand($products)];
                $item = new OrderItem();
                $item->setProductOffer($productData['offer']);
                $item->setQuantity(rand(1, 10));
                $order->addItem($item);
            }

            $manager->persist($order);
        }

        $manager->flush();
    }
}
