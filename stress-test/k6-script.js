/**
 * Stress Test — Infnet Guia
 *
 * Uso:
 *   k6 run k6-script.js
 *   k6 run -e BASE_URL=http://<NODE_IP>:30000 k6-script.js
 *
 * Instalar k6: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'

// ── Métricas personalizadas ───────────────────────────────────────────────────
const errorRate    = new Rate('errors')
const healthChecks = new Counter('health_check_requests')
const pageLoad     = new Trend('page_load_duration', true)

// ── Configuração dos estágios ─────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 10  },  // aquecimento
    { duration: '1m',  target: 50  },  // carga normal
    { duration: '30s', target: 100 },  // pico
    { duration: '1m',  target: 100 },  // sustentação do pico
    { duration: '30s', target: 200 },  // sobrecarga
    { duration: '30s', target: 0   },  // resfriamento
  ],
  thresholds: {
    http_req_duration:       ['p(95)<1000'],  // 95% das req < 1s
    http_req_failed:         ['rate<0.05'],   // menos de 5% de erros
    errors:                  ['rate<0.05'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:30000'

// ── Scenario principal ────────────────────────────────────────────────────────
export default function () {

  group('Página Principal', () => {
    const start = Date.now()
    const res = http.get(`${BASE_URL}/`, {
      tags: { name: 'HomePage' },
    })
    pageLoad.add(Date.now() - start)

    const ok = check(res, {
      'status 200':       (r) => r.status === 200,
      'tempo < 1000ms':   (r) => r.timings.duration < 1000,
      'corpo não vazio':  (r) => r.body && r.body.length > 0,
    })
    errorRate.add(!ok)
    sleep(1)
  })

  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/health`, {
      tags: { name: 'HealthCheck' },
    })
    healthChecks.add(1)

    check(res, {
      'health status 200': (r) => r.status === 200,
      'status ok':         (r) => {
        try {
          return JSON.parse(r.body).status === 'ok'
        } catch {
          return false
        }
      },
    })
    sleep(0.5)
  })

  group('Endpoint de Métricas', () => {
    const res = http.get(`${BASE_URL}/api/metrics`, {
      tags: { name: 'Metrics' },
    })

    check(res, {
      'metrics status 200':    (r) => r.status === 200,
      'content-type correto':  (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/plain'),
    })
    sleep(0.3)
  })
}

// ── Sumário ao final ──────────────────────────────────────────────────────────
export function handleSummary(data) {
  return {
    'stress-test/resultado.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}

function textSummary(data, opts) {
  const { metrics } = data
  const lines = [
    '',
    '════════════════════════════════════════',
    '  RESULTADO DO STRESS TEST — Infnet Guia',
    '════════════════════════════════════════',
    `  Requisições totais  : ${metrics.http_reqs?.values?.count ?? '-'}`,
    `  Taxa de erro        : ${((metrics.http_req_failed?.values?.rate ?? 0) * 100).toFixed(2)}%`,
    `  Duração média       : ${(metrics.http_req_duration?.values?.avg ?? 0).toFixed(2)}ms`,
    `  Latência p95        : ${(metrics.http_req_duration?.values?.['p(95)'] ?? 0).toFixed(2)}ms`,
    `  Latência p99        : ${(metrics.http_req_duration?.values?.['p(99)'] ?? 0).toFixed(2)}ms`,
    `  VUs máximo          : ${metrics.vus_max?.values?.max ?? '-'}`,
    '════════════════════════════════════════',
    '',
  ]
  return lines.join('\n')
}
