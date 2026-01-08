.PHONY: help build up down restart logs init shell-backend shell-frontend db-migrate db-fixtures

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker containers
	docker compose build

up: ## Start Docker containers
	docker compose up -d

down: ## Stop Docker containers
	docker compose down

restart: ## Restart Docker containers
	docker compose restart

logs: ## Show container logs
	docker compose logs -f

init: up ## Initialize the application (first run)
	@echo "⏳ Waiting for containers to start..."
	@sleep 15
	@echo "📦 Installing backend dependencies..."
	docker compose exec backend composer install --no-interaction
	@echo "📦 Creating database schema..."
	docker compose exec backend php bin/console doctrine:schema:create --no-interaction || docker compose exec backend php bin/console doctrine:schema:update --force --no-interaction
	@echo "🌱 Loading fixtures..."
	docker compose exec backend php bin/console doctrine:fixtures:load --no-interaction
	@echo "✅ ProcureX is ready!"
	@echo ""
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔧 Backend API: http://localhost:8000/api"
	@echo "📊 phpMyAdmin: http://localhost:8080"

shell-backend: ## Open shell in backend container
	docker compose exec backend bash

shell-frontend: ## Open shell in frontend container
	docker compose exec frontend sh

db-migrate: ## Run database migrations
	docker compose exec backend php bin/console doctrine:schema:update --force

db-fixtures: ## Load database fixtures
	docker compose exec backend php bin/console doctrine:fixtures:load --no-interaction

clean: ## Remove all containers and volumes
	docker compose down -v --remove-orphans

cache-clear:
	docker compose exec backend php bin/console cache:clear
