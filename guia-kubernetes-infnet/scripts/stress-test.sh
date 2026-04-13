#!/usr/bin/env bash
# =============================================================================
# Stress test simples — gera carga na API para o dashboard Grafana “reagir”.
#
# Uso:
#   ./scripts/stress-test.sh http://192.168.49.2:3xxxx   # use a URL do minikube service ou kubectl get svc
#   ./scripts/stress-test.sh   # tenta detectar URL do minikube
#
# Ferramentas opcionais (melhor): hey, wrk, ab
#   go install github.com/rakyll/hey@latest
#   hey -n 50000 -c 50 -m GET "$BASE/"
# =============================================================================
set -euo pipefail

if [[ "${1:-}" != "" ]]; then
  BASE="${1%/}"
else
  if command -v minikube &>/dev/null; then
    BASE="$(minikube service guia-app -n default --url 2>/dev/null | head -1 || true)"
  fi
  if [[ -z "${BASE:-}" ]]; then
    echo "Passe a URL base da API. Exemplo:"
    echo "  $0 http://<NODE_IP>:<NODEPORT>   # veja: minikube service guia-app -n default --url"
    exit 1
  fi
fi

echo ">>> Gerando carga em $BASE (60s, muitas requisições)..."
START_TS=$(date +%s)
END_TS=$((START_TS + 60))
while [[ $(date +%s) -lt $END_TS ]]; do
  for _ in {1..20}; do
    curl -sS -o /dev/null "$BASE/" || true
  done
done &
PID=$!

if command -v hey &>/dev/null; then
  hey -n 20000 -c 40 -m GET "$BASE/" &
  HEY_PID=$!
  wait "$HEY_PID" || true
fi

wait "$PID" || true
echo ">>> Concluido. Abra o Grafana, dashboard 'Guia Infnet', e capture a tela (antes/depois)."
