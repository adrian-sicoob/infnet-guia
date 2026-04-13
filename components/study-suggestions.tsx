"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { studyPathData } from "@/data/study-paths"
import type { StudyItem } from "@/types/study-item"

interface StudySuggestionsProps {
  onAddSuggestedItems: (items: Omit<StudyItem, "id">[]) => void
}

export function StudySuggestions({ onAddSuggestedItems }: StudySuggestionsProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [areaFilter, setAreaFilter] = useState("")
  const [levelFilter, setLevelFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredStudyPaths = studyPathData.filter((path) => {
    const areaMatch = !areaFilter || areaFilter === "all" || path.area === areaFilter
    const levelMatch = !levelFilter || levelFilter === "all" || path.level === levelFilter
    const searchMatch = !searchTerm || path.title.toLowerCase().includes(searchTerm.toLowerCase())
    return areaMatch && levelMatch && searchMatch
  })

  const totalPages = Math.ceil(filteredStudyPaths.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredStudyPaths.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedPath(null)
  }

  const handleAddToStudyGuide = async () => {
    if (!selectedPath) return

    setIsAdding(true)
    try {
      const selectedStudyPath = studyPathData.find((path) => path.id === selectedPath)
      if (selectedStudyPath) {
        const itemsToAdd = selectedStudyPath.items.map((item) => ({
          subject: item.title,
          category: selectedStudyPath.area,
          duration: item.duration,
          periodicity: item.periodicity,
          status: "pendente",
          institution: "Faculdade Infnet",
          reference: item.reference,
          studyLinks: item.links?.join("\n"),
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
        onAddSuggestedItems(itemsToAdd)
      }
    } catch (error) {
      console.error("Failed to add suggested items:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Encontre um roteiro de estudos</CardTitle>
          <CardDescription>Selecione um roteiro para adicionar ao seu guia</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="area">Área</Label>
              <Select
                value={areaFilter}
                onValueChange={(value) => {
                  setAreaFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger id="area">
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="data">Dados/IA</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="cloud">Cloud Computing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="level">Nível</Label>
              <Select
                value={levelFilter}
                onValueChange={(value) => {
                  setLevelFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Pesquisar</Label>
              <Input
                type="search"
                id="search"
                placeholder="Pesquisar roteiro..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((path) => (
          <Card
            key={path.id}
            className={`border-2 ${selectedPath === path.id ? "border-blue-500" : "border-transparent"} hover:shadow-md transition-all`}
            onClick={() => setSelectedPath(path.id)}
            style={{ cursor: "pointer" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {path.title}
                <Badge level={path.level} />
              </CardTitle>
              <CardDescription>{path.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {path.highlights?.map((highlight, index) => (
                  <li key={index} className="text-sm text-slate-700 dark:text-slate-300">
                    {highlight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Button onClick={handleAddToStudyGuide} disabled={isAdding || !selectedPath} className="w-full">
        {isAdding ? (
          "Adicionando ao guia..."
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar{" "}
            {selectedPath ? `${studyPathData.find((p) => p.id === selectedPath)?.items.length} itens` : "roteiro"} ao
            meu guia de estudos
          </>
        )}
      </Button>
    </div>
  )
}

function Badge({ level }: { level: string }) {
  let color = ""
  let text = ""

  switch (level) {
    case "iniciante":
      color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      text = "Iniciante"
      break
    case "intermediario":
      color = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      text = "Intermediário"
      break
    case "avancado":
      color = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      text = "Avançado"
      break
    default:
      color = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
      text = level
  }

  return <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{text}</span>
}

