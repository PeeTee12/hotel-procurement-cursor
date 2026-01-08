## ProcureX - Hotel Procurement Hub

This is **ProcureX**, a hotel procurement and ordering system designed as an architecture inspection prototype.

### **Quick Start with Docker**

```bash
# Clone and navigate to project
cd hotel-procurement-cursor

# Build and start all services
docker compose up -d --build

# Wait for services to start, then initialize database
make init

# Or manually:
docker compose exec backend composer install
docker compose exec backend php bin/console doctrine:schema:create
docker compose exec backend php bin/console doctrine:fixtures:load --no-interaction
```

**Access the application:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000/api
- 📊 **phpMyAdmin**: http://localhost:8080

### **Demo Users**

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@orea.cz | password |
| Purchase Manager | jan.novak@orea.cz | password |
| Branch Manager | marie.svobodova@orea.cz | password |

### **What It Does**

A procurement management system for hotel chains that enables:
- **Multi-organization support** with branches (e.g., Hotel A, Branch 1)
- **Product catalog** with supplier management
- **Order workflow**: browse catalog → cart → draft order → submit → approval → delivery
- **Role-based access control (RBAC)** with organization-scoped permissions
- **Approval dashboard** for managers to review and approve orders

### **Screens**

- **Login screen** with option to log in on one click according to Roles
- **Dashboard** All orders, Last orders, Pending orders
- **Buy** with product categories and cards with products which user can add to cart
- **My Orders** where customer can see their orders
- **Pending Orders** this will be only for Admins where they can approve pending orders
- **Suppliers** supplier management
- **Reports** report page with all orders
- **Settings** where users can choose UI color, user avatar, change password

### **Tech Stack**

**Backend:**
- **PHP 8.3+** with **Symfony 7.0**
- **Doctrine ORM** for entities
- **MariaDB 10.11** database
- **Composer** for dependency management

**Frontend:**
- **React 18** + **TypeScript**
- **Vite** for bundling
- **Tailwind CSS** + **Radix UI** components
- **React Router** for navigation
- **React Query** for data fetching
- **Zustand** for state management

### **Project Structure**

```
hotel-procurement-cursor/
├── backend/                    # Symfony backend
│   ├── config/                 # Symfony configuration
│   ├── src/
│   │   ├── Controller/         # API controllers
│   │   ├── Entity/             # Doctrine entities
│   │   ├── Repository/         # Doctrine repositories
│   │   ├── DataFixtures/       # Test data fixtures
│   │   └── Security/           # Authentication handlers
│   └── public/                 # Web root
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Zustand stores
│   │   └── lib/                # Utilities and API client
│   └── public/                 # Static assets
├── compose.yml                 # Docker Compose configuration
└── Makefile                    # Development commands
```

### **Key Features**

**Architecture:**
- Clean separation: Controllers → Services → Repositories → Database
- Explicit dependencies (no hidden globals)
- Immutable domain entities
- Independent, committable steps

**RBAC Model:**
- Roles: `admin`, `purchase_manager`, `branch_manager`
- Organization-scoped (users can have different roles in different orgs)

**Order Workflow:**
- States: `DRAFT → SUBMITTED → APPROVED → ORDERED → DELIVERED` (with `REJECTED`/`CANCELLED`)
- Permission-aware transitions

**Domain Model:**
- Organization → Branch → Order → OrderItem → ProductOffer → Product
- Suppliers tied to product offers

### **Make Commands**

```bash
make help           # Show all available commands
make build          # Build Docker containers
make up             # Start containers
make down           # Stop containers
make init           # Initialize application (first run)
make logs           # Show container logs
make shell-backend  # Open shell in backend container
make shell-frontend # Open shell in frontend container
make db-migrate     # Run database migrations
make db-fixtures    # Load test fixtures
make clean          # Remove all containers and volumes
```

### **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login` | POST | User authentication |
| `/api/users/quick-login/{id}` | POST | Quick login for demo |
| `/api/dashboard` | GET | Dashboard statistics |
| `/api/products` | GET | List products |
| `/api/products/categories` | GET | List categories |
| `/api/orders` | GET/POST | List/create orders |
| `/api/orders/{id}/submit` | POST | Submit order for approval |
| `/api/orders/{id}/approve` | POST | Approve order |
| `/api/orders/{id}/reject` | POST | Reject order |
| `/api/suppliers` | GET/POST | List/create suppliers |
| `/api/reports` | GET | Get reports data |
| `/api/settings/branding` | GET/PUT | Branding settings |

### **Status**

✅ Inspection-ready architecture prototype  
✅ Docker deployment ready  
✅ Full-stack implementation  
❌ Not production-ready (needs optimization, auditing, notifications)

The codebase prioritizes **explicitness and readability** over abstraction, making it ideal for architecture review and discussion.
