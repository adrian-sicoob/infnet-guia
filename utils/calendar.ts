/**
 * Cria um link para adicionar um evento ao Google Calendar
 */
export function createGoogleCalendarLink(params: {
  title: string
  description: string
  location?: string
  startDate: Date
  endDate: Date
  recurrence?: string
}): string {
  const { title, description, location, startDate, endDate, recurrence } = params

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "")
  }

  const startDateFormatted = formatDate(startDate)
  const endDateFormatted = formatDate(endDate)

  const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE"
  const titleParam = `&text=${encodeURIComponent(title)}`
  const datesParam = `&dates=${startDateFormatted}/${endDateFormatted}`
  const detailsParam = `&details=${encodeURIComponent(description)}`
  const locationParam = location ? `&location=${encodeURIComponent(location)}` : ""
  const recurrenceParam = recurrence ? `&recur=${encodeURIComponent(recurrence)}` : ""

  return `${baseUrl}${titleParam}${datesParam}${detailsParam}${locationParam}${recurrenceParam}`
}

/**
 * Calcula a data de término com base na duração
 */
export function calculateEndDate(startDate: Date, durationText: string): Date {
  const endDate = new Date(startDate)

  const minutes = extractMinutes(durationText)
  endDate.setMinutes(endDate.getMinutes() + minutes)

  return endDate
}

/**
 * Extrai minutos de uma string de duração
 */
function extractMinutes(durationText: string): number {
  const text = durationText.toLowerCase()
  const hoursMatch = text.match(/(\d+)\s*h/)
  const hours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0
  const minutesMatch = text.match(/(\d+)\s*min/)
  const minutes = minutesMatch ? Number.parseInt(minutesMatch[1], 10) : 0

  if (hours === 0 && minutes === 0) {
    const numbersMatch = text.match(/(\d+)/)
    if (numbersMatch) {
      if (text.includes("hora") || text.includes("h")) {
        return Number.parseInt(numbersMatch[1], 10) * 60
      } else {
        return Number.parseInt(numbersMatch[1], 10)
      }
    }
  }

  return hours * 60 + minutes
}

/**
 * Calcula a próxima data de estudo com base na periodicidade
 */
export function calculateNextStudyDate(periodicityText: string): Date {
  const now = new Date()
  const nextDate = new Date(now)

  nextDate.setHours(9, 0, 0, 0)

  if (now.getHours() >= 9) {
    nextDate.setDate(nextDate.getDate() + 1)
  }

  const periodicity = periodicityText.toLowerCase()

  if (periodicity.includes("semanal")) {
    const dayOfWeek = nextDate.getDay() // 0 = Sunday, 1 = Monday, ...
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    nextDate.setDate(nextDate.getDate() + daysUntilMonday)
  } else if (periodicity.includes("mensal")) {
    nextDate.setMonth(nextDate.getMonth() + 1)
    nextDate.setDate(1)
  } else if (periodicity.includes("bissemanal")) {
    const dayOfWeek = nextDate.getDay()
    if (dayOfWeek < 1) {
      nextDate.setDate(nextDate.getDate() + 1)
    } else if (dayOfWeek < 4) {
      nextDate.setDate(nextDate.getDate() + (4 - dayOfWeek))
    } else {
      nextDate.setDate(nextDate.getDate() + (8 - dayOfWeek))
    }
  }

  return nextDate
}

/**
 * Gera o parâmetro de recorrência para o Google Calendar com base na periodicidade
 */
export function getRecurrenceRule(periodicityText: string): string {
  const periodicity = periodicityText.toLowerCase()

  if (periodicity.includes("diário")) {
    return "RRULE:FREQ=DAILY"
  } else if (periodicity.includes("semanal") && !periodicity.includes("bissemanal")) {
    return "RRULE:FREQ=WEEKLY"
  } else if (periodicity.includes("bissemanal")) {
    return "RRULE:FREQ=WEEKLY;BYDAY=MO,TH"
  } else if (periodicity.includes("mensal")) {
    return "RRULE:FREQ=MONTHLY"
  }

  return ""
}

