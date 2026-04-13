# Guia Kubernetes — Laboratório Infnet

Roteiro para entregar: imagem no Docker Hub, Deployment no Kubernetes (NodePort, probes), Prometheus + Grafana, pipeline CI/CD e stress test com print do dashboard.

- **App:** imagem `oliveirarenan1/guia-infnet`, porta **3000**, **2 réplicas**, sem banco.
- **Manifests acadêmicos:** namespace `default`, Prometheus com **emptyDir** (sem PVC), NodePort **dinâmico** (evita conflito de porta).
- **Sua imagem:** `docker push` e altere `image` no `Deployment` `guia-app` em `k8s/deployment.yaml` (mantenha porta 3000 e probes alinhados à app).

---

## Subir o cluster e aplicar

**Pré-requisitos:** `kubectl` apontando para o cluster; opcional Docker para build/push.

```bash
minikube start --driver=docker    # ou kind, Docker Desktop K8s, nuvem
cd /caminho/para/guia-kubernetes-infnet
chmod +x scripts/apply-all.sh scripts/stress-test.sh   # primeira vez
./scripts/apply-all.sh
```

Manual (mesma ordem: app+Grafana antes do Prometheus):

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/prometheus.yaml
kubectl rollout status deployment/guia-app deployment/prometheus deployment/grafana -n default --timeout=180s
```

**Conferir:** `kubectl get pods,svc -n default` — `guia-app` e `grafana` em **Running**; `prometheus` **ClusterIP** na 9090.

**URLs**

| O quê | Como abrir |
|--------|------------|
| App | `minikube service guia-app -n default --url` ou `http://<IP-nó>:<NodePort>` (`kubectl get svc guia-app -n default`) |
| Grafana | `minikube service grafana -n default --url` |
| Prometheus | `kubectl port-forward -n default svc/prometheus 9090:9090` → http://localhost:9090 |

**Grafana:** usuário `admin`, senha `admin123`. **Dashboards** → pasta **Infnet** → **Guia Infnet - Prometheus + Nó (lab)**.

**Targets no Prometheus:** jobs `prometheus` e `node_exporter` (métricas do **nó** onde o pod do Prometheus roda; em cluster de 1 nó cobre o host).

Teste rápido da app:

```bash
N=$(kubectl get svc guia-app -n default -o jsonpath='{.spec.ports[0].nodePort}')
curl -sS -o /dev/null -w "%{http_code}\n" "http://$(minikube ip):${N}/"   # esperado 200
```

**kind:** `kind create cluster` antes do apply; NodePort costuma exigir `port-forward` ou mapeamento extra — para aulas, Minikube é mais direto.

---

## O que há em `k8s/`

| Arquivo | Conteúdo |
|---------|----------|
| `deployment.yaml` | `Deployment` + `Service` NodePort `guia-app`; Grafana (NodePort, datasource Prometheus, dashboard JSON); login admin/admin123 |
| `prometheus.yaml` | `ConfigMap` (`prometheus.yml`), `Deployment` (Prometheus + sidecar **node_exporter** com `hostPath` em `/proc`, `/sys`, `/`), `Service` ClusterIP 9090, TSDB em emptyDir |

| Pasta / script | Uso |
|----------------|-----|
| `app/` | Snippets opcionais para `/metrics` na aplicação |
| `scripts/apply-all.sh` | Apply + rollout status |
| `scripts/stress-test.sh` | Carga HTTP para o laboratório |
| `.github/workflows/kubernetes-deploy.yml` | Deploy via GitHub Actions |

**Portas:** Service da app e do Grafana usam porta **3000** internamente; o número **30000–32767** é o NodePort no nó (`kubectl get svc`). Para fixar (ex. 30080), defina `nodePort` no Service e garanta que esteja livre.

---

## Limpar (sem apagar o namespace `default`)

```bash
kubectl delete deployment guia-app grafana prometheus -n default
kubectl delete service guia-app grafana prometheus -n default
kubectl delete configmap grafana-datasources grafana-dashboard-provider grafana-dashboard-json prometheus-config -n default
```

RBAC antigo (se existir): `kubectl delete clusterrole,clusterrolebinding prometheus-guia-infnet`. Namespace legado: `kubectl delete namespace guia-infnet`.

---

## Checklist do enunciado

- [ ] Imagem no Docker Hub
- [ ] Deployment com réplicas pedidas (guia: **2**)
- [ ] NodePort na app (`kubectl get svc` / `minikube service`)
- [ ] Readiness + Liveness
- [ ] Prometheus (ClusterIP) + Grafana (NodePort); persistência: guia usa emptyDir; para PVC, monte claim no Deployment do Prometheus
- [ ] Dashboard no Grafana
- [ ] Pipeline (Actions ou equivalente)
- [ ] Stress test + prints antes/depois

*(BD/cache só se o enunciado exigir — este guia é stateless.)*

---

## Docker Hub

```bash
docker login
docker build -t SEU_USUARIO/minha-app:latest -f Dockerfile .
docker push SEU_USUARIO/minha-app:latest
```

Atualize `image` em `k8s/deployment.yaml` (`guia-app`); mantenha **3000** se a app escutar nessa porta.

---

## Editar dashboard ou Prometheus

- Dashboard: `ConfigMap` `grafana-dashboard-json` em `k8s/deployment.yaml` → `kubectl apply -f k8s/deployment.yaml` → `kubectl rollout restart deployment/grafana -n default`
- Scrape / Prometheus: `k8s/prometheus.yaml` → `kubectl apply -f k8s/prometheus.yaml` (reinicie o Deployment do Prometheus se precisar)

**Métricas por pod** (não coberto pelo guia mínimo): cAdvisor/kubelet ou `/metrics` na app — ver `app/server-metrics-snippet.js`.

---

## Stress test

```bash
./scripts/stress-test.sh "$(minikube service guia-app -n default --url | head -1)"
```

Capture o Grafana (ex. últimos 30 min). O painel foca Prometheus + nó; carga na app sem `/metrics`/cAdvisor não aparece como CPU por container.

---

## GitHub Actions

Workflow: push em `main`/`master` ou **Run workflow** manual.

1. Secret **`KUBE_CONFIG`**: conteúdo de `~/.kube/config` (não commite).
2. O job aplica `k8s/deployment.yaml` e `k8s/prometheus.yaml` e aguarda rollouts.

No YAML há job comentado para build/push Docker (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`). Jenkins/GitLab CI etc. servem se reproduzirem os mesmos applies.

---

## Problemas comuns

| Sintoma | Ação |
|---------|------|
| PVC Pending | Só se usar PVC: `kubectl describe pvc`; ajuste `storageClassName` |
| CrashLoopBackOff | `kubectl logs -l app=guia-app -n default`; porta e probes |
| ImagePullBackOff | Confira `image` no Deployment |
| Grafana sem dados | Datasource `http://prometheus:9090`; Targets UP |
| Objetos legados (Postgres) | Remover recursos antigos ou recriar cluster de lab |

---

Bons estudos. Detalhes extras nos comentários dos YAMLs.
