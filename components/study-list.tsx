"use client"

import { useState } from "react"
import type { StudyItem } from "@/types/study-item"
import { StudyCard } from "@/components/study-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Filter } from "lucide-react"

interface StudyListProps {
  items: StudyItem[]
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, status: string, observation?: string) => void
  onEdit: (item: StudyItem) => void
}

export function StudyList({ items, onDelete, onUpdateStatus, onEdit }: StudyListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const groupedItems = items.reduce(
    (acc, item) => {
      const category = item.category || "Sem categoria"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    },
    {} as Record<string, StudyItem[]>,
  )

  const filteredGroups = Object.entries(groupedItems)
    .filter(([category]) => {
      if (!categoryFilter) return true
      return category.toLowerCase() === categoryFilter.toLowerCase()
    })
    .map(([category, groupItems]) => {
      const filteredItems = groupItems.filter((item) => {
        const matchesSearch =
          !searchTerm ||
          item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.institution?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = !statusFilter || item.status === statusFilter

        return matchesSearch && matchesStatus
      })

      return [category, filteredItems] as [string, StudyItem[]]
    })
    .filter(([_, groupItems]) => groupItems.length > 0)

  if (items.length === 0) {
    return (
      <Alert className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <AlertDescription className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <BookOpen className="h-5 w-5" />
          Você ainda não adicionou nenhum item ao seu guia de estudos.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar estudos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-slate-500" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="data">Dados/IA</SelectItem>
              <SelectItem value="security">Segurança</SelectItem>
              <SelectItem value="design">UX/UI</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
              <SelectItem value="Sem categoria">Sem categoria</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <Alert className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDescription className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Search className="h-5 w-5" />
            Nenhum resultado encontrado para sua busca.
          </AlertDescription>
        </Alert>
      ) : (
        filteredGroups.map(([category, groupItems]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
              {category} ({groupItems.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {groupItems.map((item) => (
                <StudyCard
                  key={item.id}
                  item={item}
                  onDelete={onDelete}
                  onUpdateStatus={onUpdateStatus}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

