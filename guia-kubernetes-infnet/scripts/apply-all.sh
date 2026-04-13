#!/usr/bin/env bash
# =============================================================================
# Aplica deployment.yaml (app + Grafana) e prometheus.yaml (métricas).
# Uso: ./scripts/apply-all.sh   (na raiz do projeto guia-kubernetes-infnet)
# =============================================================================
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/prometheus.yaml

echo ">>> Aguardando Pods (timeout 180s)..."
kubectl rollout status deployment/guia-app -n default --timeout=180s
kubectl rollout status deployment/prometheus -n default --timeout=180s
kubectl rollout status deployment/grafana -n default --timeout=180s

echo ">>> Pronto. kubectl get pods,svc -n default"
