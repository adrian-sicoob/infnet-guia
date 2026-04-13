"use client"

import { useMemo } from "react"
import type { StudyItem } from "@/types/study-item"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ClockIcon, AlertCircle, PieChart, BarChart3, Calendar, BookOpen } from "lucide-react"

interface StudyDashboardProps {
  items: StudyItem[]
}

export function StudyDashboard({ items }: StudyDashboardProps) {
  const stats = useMemo(() => {
    const total = items.length
    const completed = items.filter((item) => item.status === "concluido").length
    const pending = items.filter((item) => item.status === "pendente").length
    const waiting = items.filter((item) => item.status === "aguardando").length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const byCategory = items.reduce(
      (acc, item) => {
        const category = item.category || "Sem categoria"
        if (!acc[category]) {
          acc[category] = { total: 0, completed: 0 }
        }
        acc[category].total++
        if (item.status === "concluido") {
          acc[category].completed++
        }
        return acc
      },
      {} as Record<string, { total: number; completed: number }>,
    )

    return {
      total,
      completed,
      pending,
      waiting,
      completionRate,
      byCategory,
    }
  }, [items])

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Adicione itens ao seu guia de estudos para visualizar estatísticas aqui.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Estudos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.completed}</div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{stats.pending}</div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Aguardando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{stats.waiting}</div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Taxa de Conclusão
            </CardTitle>
            <CardDescription>Progresso geral dos seus estudos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Progresso</span>
                <span className="text-sm font-medium">{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />

              <div className="pt-4 grid grid-cols-3 text-center">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Concluídos</div>
                  <div className="text-lg font-medium text-green-600 dark:text-green-500">{stats.completed}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Pendentes</div>
                  <div className="text-lg font-medium text-yellow-600 dark:text-yellow-500">{stats.pending}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Aguardando</div>
                  <div className="text-lg font-medium text-blue-600 dark:text-blue-500">{stats.waiting}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progresso por Categoria
            </CardTitle>
            <CardDescription>Distribuição dos estudos por área</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.byCategory).map(([category, data]) => {
                const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {data.completed}/{data.total} ({rate}%)
                      </span>
                    </div>
                    <Progress value={rate} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Visão Geral de Estudos - Faculdade Infnet
          </CardTitle>
          <CardDescription>Resumo de todos os seus estudos por status na Faculdade Infnet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h3 className="font-medium">Concluídos</h3>
              </div>
              {items
                .filter((item) => item.status === "concluido")
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="text-sm pl-5 border-l border-green-200 dark:border-green-800">
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.category || "Sem categoria"}</p>
                  </div>
                ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <h3 className="font-medium">Pendentes</h3>
              </div>
              {items
                .filter((item) => item.status === "pendente")
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="text-sm pl-5 border-l border-yellow-200 dark:border-yellow-800">
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.category || "Sem categoria"}</p>
                  </div>
                ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="font-medium">Aguardando</h3>
              </div>
              {items
                .filter((item) => item.status === "aguardando")
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="text-sm pl-5 border-l border-blue-200 dark:border-blue-800">
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.category || "Sem categoria"}
                      {item.observation
                        ? " - " + item.observation.substring(0, 30) + (item.observation.length > 30 ? "..." : "")
                        : ""}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

