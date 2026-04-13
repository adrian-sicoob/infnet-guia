#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-stress-test.sh — Executa o stress test do Infnet Guia com k6
#
# Pré-requisitos:
#   - k6 instalado  →  https://k6.io/docs/getting-started/installation/
#   - Aplicação rodando (local ou no cluster Kubernetes)
#
# Uso:
#   ./run-stress-test.sh                        # localhost:30000
#   ./run-stress-test.sh http://192.168.1.10:30000
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE_URL="${1:-http://localhost:30000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================"
echo " Stress Test — Infnet Guia"
echo " Alvo : ${BASE_URL}"
echo "========================================"

# Verificar se k6 está instalado
if ! command -v k6 &>/dev/null; then
    echo ""
    echo "❌  k6 não encontrado. Instale via:"
    echo "    https://k6.io/docs/getting-started/installation/"
    echo ""
    echo "    No Ubuntu/Debian:"
    echo "    sudo gpg -k"
    echo '    sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69'
    echo '    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list'
    echo "    sudo apt-get update && sudo apt-get install k6"
    exit 1
fi

echo ""
echo "➡  Verificando saúde da aplicação..."
if ! curl -sf "${BASE_URL}/api/health" | grep -q '"status":"ok"'; then
    echo "❌  Aplicação não está respondendo em ${BASE_URL}/api/health"
    echo "    Verifique se a aplicação está rodando."
    exit 1
fi
echo "✅  Aplicação saudável!"

echo ""
echo "➡  Iniciando stress test..."
echo ""

k6 run \
    --env BASE_URL="${BASE_URL}" \
    --out json="${SCRIPT_DIR}/resultado-raw.json" \
    "${SCRIPT_DIR}/k6-script.js"

echo ""
echo "✅  Stress test concluído!"
echo "    Resultados em: ${SCRIPT_DIR}/resultado.json"
echo "    Raw data em  : ${SCRIPT_DIR}/resultado-raw.json"
