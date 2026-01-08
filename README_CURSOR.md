###ProcureX - Hotel Procurement Hub
Vytvořil jsem kompletní funkční prototyp podle screenshotů s následující strukturou:
Backend (Symfony 7.0 + PHP 8.3)
###Doctrine Entity:
Organization - organizace s whitelabel nastavením
Branch - pobočky hotelů
User - uživatelé s rolemi
UserOrganization - vazba uživatel-organizace s rolí
Category - kategorie produktů
Product - produkty
ProductOffer - nabídky produktů od dodavatelů
Supplier - dodavatelé
Order - objednávky
OrderItem - položky objednávek
API Controllery:
AuthController - přihlášení, quick login
DashboardController - statistiky dashboardu
ProductController - produkty a kategorie
OrderController - CRUD objednávek + workflow (submit/approve/reject)
SupplierController - správa dodavatelů
ReportController - reporty
SettingsController - nastavení brandingu
CartController - košík (session-based)
Frontend (React 18 + TypeScript + Tailwind CSS)
Stránky:
LoginPage - přihlášení s quick login
DashboardPage - přehled objednávek a statistik
BuyPage - katalog produktů s kategoriemi
MyOrdersPage - moje objednávky
ApprovalsPage - schvalování objednávek (admin)
SuppliersPage - správa dodavatelů
ReportsPage - reporty
SettingsPage - whitelabel nastavení
Docker (compose.yml)
Služby:
backend - PHP 8.3 + Apache
frontend - Node.js 20 + Vite
database - MariaDB 10.11
phpmyadmin - správa databáze
Spuštění
# Spustit všechny službydocker compose up -d --build# Inicializovat databázi a fixturesmake init# Nebo manuálně:docker compose exec backend composer installdocker compose exec backend php bin/console doctrine:schema:createdocker compose exec backend php bin/console doctrine:fixtures:load --no-interaction
Přístupy:
🌐 Frontend: http://localhost:3000
🔧 Backend API: http://localhost:8000/api
📊 phpMyAdmin: http://localhost:8080
Demo uživatelé:
Role	Email	Heslo
Administrátor	admin@orea.cz	password
Nákupčí	jan.novak@orea.cz	password
Manažer pobočky	marie.svobodova@orea.cz	password
