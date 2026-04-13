#!/usr/bin/env bash
set -euo pipefail

echo "==> Criando namespace..."
kubectl apply -f namespace.yaml

echo "==> Aguardando namespace ficar ativo..."
kubectl wait --for=jsonpath='{.status.phase}'=Active namespace/infnet-guia --timeout=30s

echo "==> Criando Redis..."
kubectl apply -f redis/deployment.yaml
kubectl apply -f redis/service.yaml

echo "==> Criando aplicação principal..."
kubectl apply -f app/deployment.yaml
kubectl apply -f app/service.yaml

echo "==> Criando stack de monitoramento..."
kubectl apply -f monitoring/prometheus-pvc.yaml
kubectl apply -f monitoring/prometheus-configmap.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl apply -f monitoring/prometheus-service.yaml
kubectl apply -f monitoring/grafana-configmaps.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
kubectl apply -f monitoring/grafana-service.yaml

echo ""
echo "==> Aguardando rollout da aplicação (4 réplicas)..."
kubectl rollout status deployment/infnet-guia -n infnet-guia --timeout=120s

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "Acesso externo:"
echo "  Aplicação : http://<NODE_IP>:30000"
echo "  Grafana   : http://<NODE_IP>:30001  (admin / admin123)"
