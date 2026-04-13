import { getRegistry } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

export async function GET() {
  const registry = getRegistry()
  const metrics = await registry.metrics()

  return new Response(metrics, {
    headers: {
      'Content-Type': registry.contentType,
    },
  })
}
