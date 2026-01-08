#!/bin/bash

echo "🚀 Initializing ProcureX..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "📦 Running database migrations..."
docker compose exec backend php bin/console doctrine:schema:create --no-interaction || true
docker compose exec backend php bin/console doctrine:schema:update --force --no-interaction

# Load fixtures
echo "🌱 Loading fixtures..."
docker compose exec backend php bin/console doctrine:fixtures:load --no-interaction

echo "✅ ProcureX is ready!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000/api"
echo "📊 phpMyAdmin: http://localhost:8080"
