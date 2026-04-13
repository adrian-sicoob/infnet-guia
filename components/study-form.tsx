"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StudyItem } from "@/types/study-item"
import { Clock, Calendar, BookOpen, Building, Link2, FileText, X } from "lucide-react"

interface StudyFormProps {
  onAddItem: (item: StudyItem) => void
  onUpdateItem: (item: StudyItem) => void
  editingItem: StudyItem | null
  onCancelEdit: () => void
}

export function StudyForm({ onAddItem, onUpdateItem, editingItem, onCancelEdit }: StudyFormProps) {
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("")
  const [duration, setDuration] = useState("")
  const [periodicity, setPeriodicity] = useState("")
  const [institution, setInstitution] = useState("")
  const [otherInstitution, setOtherInstitution] = useState("")
  const [reference, setReference] = useState("")
  const [studyLinks, setStudyLinks] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfFileName, setPdfFileName] = useState("")

  useEffect(() => {
    if (editingItem) {
      setSubject(editingItem.subject)
      setCategory(editingItem.category || "")
      setDuration(editingItem.duration)
      setPeriodicity(editingItem.periodicity)
      setInstitution(editingItem.institution || "")
      setOtherInstitution(editingItem.otherInstitution || "")
      setReference(editingItem.reference || "")
      setStudyLinks(editingItem.studyLinks || "")
      setPdfFileName(editingItem.pdfFileName || "")
    } else {
      resetForm()
    }
  }, [editingItem])

  const resetForm = () => {
    setSubject("")
    setCategory("")
    setDuration("")
    setPeriodicity("")
    setInstitution("")
    setOtherInstitution("")
    setReference("")
    setStudyLinks("")
    setPdfFile(null)
    setPdfFileName("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject || !duration || !periodicity) return

    const pdfData = pdfFile
      ? { pdfBase64: URL.createObjectURL(pdfFile), pdfFileName: pdfFile.name }
      : { pdfBase64: editingItem?.pdfBase64 || "", pdfFileName: pdfFileName || "" }

    const finalInstitution = institution === "Outra" && otherInstitution ? otherInstitution : institution

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        subject,
        category,
        duration,
        periodicity,
        institution: finalInstitution,
        otherInstitution: institution === "Outra" ? otherInstitution : "",
        reference,
        studyLinks,
        ...pdfData,
        updatedAt: new Date().toISOString(),
      })
    } else {
      onAddItem({
        id: "",
        subject,
        category,
        duration,
        periodicity,
        status: "pendente",
        institution: finalInstitution,
        otherInstitution: institution === "Outra" ? otherInstitution : "",
        reference,
        studyLinks,
        ...pdfData,
        observation: "",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    resetForm()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0])
      setPdfFileName(e.target.files[0].name)
    }
  }

  return (
    <Card className="shadow-md border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{editingItem ? "Editar Estudo" : "Adicionar Novo Estudo"}</CardTitle>
        {editingItem && (
          <Button variant="ghost" size="icon" onClick={onCancelEdit}>
            <X className="h-4 w-4" />
            <span className="sr-only">Cancelar edição</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />O que você vai estudar?
              </Label>
              <Input
                id="subject"
                placeholder="Ex: React, AWS, Python..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="focus-visible:ring-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria/Área</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="data">Dados/IA</SelectItem>
                  <SelectItem value="security">Segurança</SelectItem>
                  <SelectItem value="design">UX/UI</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo de estudo
              </Label>
              <Input
                id="duration"
                placeholder="Ex: 30 minutos, 1 hora..."
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="focus-visible:ring-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodicity" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Periodicidade
              </Label>
              <Select value={periodicity} onValueChange={setPeriodicity}>
                <SelectTrigger id="periodicity">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diário">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="bissemanal">Duas vezes por semana</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Instituição de Ensino
              </Label>
              <Select value={institution} onValueChange={setInstitution}>
                <SelectTrigger id="institution">
                  <SelectValue placeholder="Selecione uma instituição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Infnet">Faculdade Infnet</SelectItem>
                  <SelectItem value="Udemy">Udemy</SelectItem>
                  <SelectItem value="Coursera">Coursera</SelectItem>
                  <SelectItem value="Alura">Alura</SelectItem>
                  <SelectItem value="Pluralsight">Pluralsight</SelectItem>
                  <SelectItem value="edX">edX</SelectItem>
                  <SelectItem value="LinkedIn Learning">LinkedIn Learning</SelectItem>
                  <SelectItem value="Outra">Outra</SelectItem>
                </SelectContent>
              </Select>

              {institution === "Outra" && (
                <div className="mt-2">
                  <Input
                    placeholder="Qual instituição?"
                    value={otherInstitution}
                    onChange={(e) => setOtherInstitution(e.target.value)}
                    className="focus-visible:ring-slate-400"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Referência/Curso</Label>
              <Input
                id="reference"
                placeholder="Ex: Curso de React Avançado"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="focus-visible:ring-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studyLinks" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Links de Estudo (um por linha)
            </Label>
            <Textarea
              id="studyLinks"
              placeholder="Ex: https://exemplo.com/curso"
              value={studyLinks}
              onChange={(e) => setStudyLinks(e.target.value)}
              className="min-h-[80px] focus-visible:ring-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfFile" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Material de Estudo (PDF)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdfFile"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="focus-visible:ring-slate-400"
              />
              {pdfFileName && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Arquivo atual: {pdfFileName}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all"
          >
            {editingItem ? "Atualizar Estudo" : "Adicionar ao Guia de Estudos"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

