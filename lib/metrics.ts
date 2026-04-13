import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client'

type MetricsGlobal = typeof global & {
  __metricsRegistry: Registry | undefined
  __httpRequestsTotal: Counter | undefined
  __httpRequestDuration: Histogram | undefined
  __activeConnections: Gauge | undefined
}

const g = global as MetricsGlobal

function initRegistry() {
  const registry = new Registry()

  collectDefaultMetrics({ register: registry, prefix: 'infnet_guia_' })

  g.__httpRequestsTotal = new Counter({
    name: 'infnet_guia_http_requests_total',
    help: 'Total de requisições HTTP recebidas',
    labelNames: ['method', 'path', 'status'],
    registers: [registry],
  })

  g.__httpRequestDuration = new Histogram({
    name: 'infnet_guia_http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [registry],
  })

  g.__activeConnections = new Gauge({
    name: 'infnet_guia_active_connections',
    help: 'Número de conexões ativas no momento',
    registers: [registry],
  })

  g.__metricsRegistry = registry
}

if (!g.__metricsRegistry) {
  initRegistry()
}

export const metricsRegistry = g.__metricsRegistry!
export const httpRequestsTotal = g.__httpRequestsTotal!
export const httpRequestDuration = g.__httpRequestDuration!
export const activeConnections = g.__activeConnections!

export function getRegistry(): Registry {
  if (!g.__metricsRegistry) initRegistry()
  return g.__metricsRegistry!
}
