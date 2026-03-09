#!/usr/bin/env bash
# Run ON the main Resona server (18.141.140.150).
# SSH: ssh -i "resona-main.pem" ubuntu@18.141.140.150
# Then: bash scripts/check-main-server.sh  (or copy to server and run)

set -e
echo "=== Main Resona server checks ==="

# Backend (Docker: 8001->8000, or direct: 8000)
echo ""
echo "--- Backend (8000 or 8001) ---"
for port in 8001 8000; do
  if command -v curl &>/dev/null; then
    code=$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 2 "http://127.0.0.1:$port/health" 2>/dev/null) && echo "Port $port: HTTP $code" && break
  fi
done
echo "Listening:"
ss -tlnp 2>/dev/null | grep -E '8000|8001' || netstat -tlnp 2>/dev/null | grep -E '8000|8001' || true

# Frontend (8080, 3001, or 3000 — Docker often maps 8080->3000)
echo ""
echo "--- Frontend (8080 / 3001 / 3000) ---"
for port in 8080 3001 3000; do
  if command -v curl &>/dev/null; then
    code=$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 2 "http://127.0.0.1:$port/" 2>/dev/null) && echo "Port $port: HTTP $code" && break
  fi
done
ss -tlnp 2>/dev/null | grep -E '8080|3000|3001' || true

# LiveKit (7880)
echo ""
echo "--- LiveKit (7880) ---"
if command -v curl &>/dev/null; then
  curl -sf -o /dev/null -w "HTTP %{http_code}\n" --connect-timeout 2 "http://127.0.0.1:7880/" 2>/dev/null || echo "LiveKit not responding on 7880"
fi
ss -tlnp 2>/dev/null | grep 7880 || true

# Redis
echo ""
echo "--- Redis (6379) ---"
(echo "PING" | timeout 1 nc -q 1 127.0.0.1 6379 2>/dev/null | grep -q PONG) && echo "Redis OK" || echo "Redis not responding"

# Docker
echo ""
echo "--- Docker containers ---"
docker ps 2>/dev/null || echo "Docker not running or no permission"

# Agent worker (systemd or process)
echo ""
echo "--- Agent worker ---"
systemctl is-active resona-agent 2>/dev/null && echo "resona-agent service: active" || true
pgrep -af "agent_worker" 2>/dev/null || echo "No agent_worker process found"

# Nginx/Caddy (optional)
echo ""
echo "--- Reverse proxy ---"
systemctl is-active nginx 2>/dev/null && echo "nginx: active" || true
systemctl is-active caddy 2>/dev/null && echo "caddy: active" || true

echo ""
echo "=== Done ==="
