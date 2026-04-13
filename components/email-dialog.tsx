"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"

interface EmailDialogProps {
  onEmailSaved: (email: string) => void
}

export function EmailDialog({ onEmailSaved }: EmailDialogProps) {
  const [email, setEmail] = useState("")
  const [open, setOpen] = useState(false)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail")

    if (!savedEmail) {
      setOpen(true)
    } else {
      onEmailSaved(savedEmail)
    }
  }, [onEmailSaved])

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsValid(emailRegex.test(email))
  }, [email])

  const handleSaveEmail = () => {
    if (!isValid) return

    localStorage.setItem("userEmail", email)
    sessionStorage.setItem("userEmail", email)
    onEmailSaved(email)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configurar Integração com Google Agenda
          </DialogTitle>
          <DialogDescription>
            Informe seu email para criar eventos no Google Agenda quando adicionar novos estudos. Este email será salvo
            apenas no seu navegador.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Seu email do Google</Label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {email && !isValid && <p className="text-sm text-red-500">Por favor, insira um email válido</p>}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveEmail} disabled={!isValid}>
            Salvar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

