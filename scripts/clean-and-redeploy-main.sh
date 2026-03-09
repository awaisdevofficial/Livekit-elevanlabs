#!/usr/bin/env bash
# Run on MAIN server (18.141.140.150).
# Full wipe: removes project dir and all app containers. You then re-copy the project and run deploy.
# Usage:
#   bash scripts/clean-and-redeploy-main.sh          # reset containers + rebuild (keeps project dir)
#   bash scripts/clean-and-redeploy-main.sh full-wipe   # delete project dir too; then copy project and run deploy-main.sh

set -e
PROJECT_DIR="${PROJECT_DIR:-/home/ubuntu/resona.ai}"
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="resonaai"

if [ "$1" = "full-wipe" ]; then
  cd "$PROJECT_DIR" 2>/dev/null || { echo "Project dir not found: $PROJECT_DIR"; exit 1; }
  echo "=== Full wipe: stopping containers and removing project dir ==="
  docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down -v 2>/dev/null || true
  sudo systemctl stop resona-agent 2>/dev/null || true
  if [ -f "backend/.env.production" ]; then
    cp -a backend/.env.production /tmp/resona.env.production.bak
    echo "Backed up backend/.env.production to /tmp/resona.env.production.bak"
  fi
  cd /home/ubuntu
  rm -rf "$PROJECT_DIR"
  echo ""
  echo "Done. Project directory removed."
  echo "Next: copy your resona.ai project to $PROJECT_DIR (e.g. from your PC: rsync or scp),"
  echo "restore env: cp /tmp/resona.env.production.bak $PROJECT_DIR/backend/.env.production"
  echo "Then run: cd $PROJECT_DIR && bash scripts/deploy-main.sh"
  exit 0
fi

cd "$PROJECT_DIR" 2>/dev/null || { echo "Project dir not found: $PROJECT_DIR"; exit 1; }
echo "=== Stopping and removing containers (keeping project dir) ==="
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down -v
echo "=== Building and starting fresh ==="
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --env-file backend/.env.production up -d --build
echo "=== Done. Check: docker ps ==="
