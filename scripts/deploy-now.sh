#!/usr/bin/env bash
# One-command deploy: pull, migrate phone_numbers, rebuild and restart backend.
# Run on server: cd /home/ubuntu/resona.ai && bash scripts/deploy-now.sh

set -e
cd "$(dirname "$0")/.." || exit 1
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="resonaai"

echo "=== Git pull ==="
git fetch origin
git pull origin main

echo ""
echo "=== Phone numbers migration ==="
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --env-file backend/.env.production run --rm backend python scripts/run_migrate_phone_numbers.py 2>/dev/null || true

echo ""
echo "=== Rebuild and restart backend ==="
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --env-file backend/.env.production up -d --build backend

echo ""
echo "Done. Backend restarted."
