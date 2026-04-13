"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudyForm } from "@/components/study-form"
import { StudyList } from "@/components/study-list"
import { StudyDashboard } from "@/components/study-dashboard"
import { StudySuggestions } from "@/components/study-suggestions"
import { EmailDialog } from "@/components/email-dialog"
import { createGoogleCalendarLink, calculateEndDate, calculateNextStudyDate, getRecurrenceRule } from "@/utils/calendar"
import type { StudyItem } from "@/types/study-item"
import { PlusCircle, BarChart, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function StudyGuideApp() {
  const [studyItems, setStudyItems] = useState<StudyItem[]>([])
  const [editingItem, setEditingItem] = useState<StudyItem | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const savedItems = localStorage.getItem("infnetStudyItems")
    if (savedItems) {
      setStudyItems(JSON.parse(savedItems))
    }

    const savedEmail = localStorage.getItem("userEmail")
    if (savedEmail) {
      setUserEmail(savedEmail)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("infnetStudyItems", JSON.stringify(studyItems))
  }, [studyItems])

  const handleEmailSaved = (email: string) => {
    setUserEmail(email)
  }

  const addStudyItem = (item: StudyItem) => {
    const newItem = { ...item, id: Date.now().toString() }
    setStudyItems([...studyItems, newItem])

    if (userEmail) {
      createCalendarEvent(newItem)
    }
  }

  const addSuggestedItems = (items: Omit<StudyItem, "id">[]) => {
    const newItems = items.map((item) => ({
      ...item,
      id: Date.now() + Math.random().toString(36).substring(2, 9),
    }))

    setStudyItems([...studyItems, ...newItems])

    toast({
      title: "Roteiro adicionado",
      description: `${newItems.length} itens de estudo foram adicionados ao seu guia.`,
    })
  }

  const createCalendarEvent = (item: StudyItem) => {
    const startDate = calculateNextStudyDate(item.periodicity)
    const endDate = calculateEndDate(startDate, item.duration)
    const recurrence = getRecurrenceRule(item.periodicity)

    const description = `
      Matéria: ${item.subject}
      Categoria: ${item.category || "Não especificada"}
      Duração: ${item.duration}
      Periodicidade: ${item.periodicity}
      Instituição: ${item.institution || "Não especificada"}
      Referência: ${item.reference || "Não especificada"}
      ${item.studyLinks ? `Links de estudo: ${item.studyLinks}` : ""}
    `.trim()

    const calendarLink = createGoogleCalendarLink({
      title: `Estudo: ${item.subject}`,
      description,
      startDate,
      endDate,
      location: item.institution || undefined,
      recurrence: recurrence,
    })

    window.open(calendarLink, "_blank")

    toast({
      title: "Evento criado no Google Agenda",
      description: `Um evento recorrente para estudar "${item.subject}" foi criado no seu Google Agenda.`,
    })
  }

  const updateStudyItem = (updatedItem: StudyItem) => {
    setStudyItems(studyItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    setEditingItem(null)
  }

  const deleteStudyItem = (id: string) => {
    setStudyItems(studyItems.filter((item) => item.id !== id))
  }

  const updateStatus = (id: string, status: string, observation?: string) => {
    setStudyItems(
      studyItems.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              observation: observation || item.observation,
            }
          : item,
      ),
    )
  }

  const startEditing = (item: StudyItem) => {
    setEditingItem(item)
  }

  return (
    <>
      <EmailDialog onEmailSaved={handleEmailSaved} />

      <Tabs defaultValue="list" className="space-y-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Gerenciar
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Sugestões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-8">
          <StudyForm
            onAddItem={addStudyItem}
            onUpdateItem={updateStudyItem}
            editingItem={editingItem}
            onCancelEdit={() => setEditingItem(null)}
          />
          <StudyList
            items={studyItems}
            onDelete={deleteStudyItem}
            onUpdateStatus={updateStatus}
            onEdit={startEditing}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <StudyDashboard items={studyItems} />
        </TabsContent>

        <TabsContent value="suggestions">
          <StudySuggestions onAddSuggestedItems={addSuggestedItems} />
        </TabsContent>
      </Tabs>
    </>
  )
}

