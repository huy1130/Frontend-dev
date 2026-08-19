export const getLocalDateString = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const parseApiDate = (dateInput?: string | Date | null): Date | null => {
  if (!dateInput) return null
  if (dateInput instanceof Date) return dateInput

  let date = new Date(dateInput)
  if (isNaN(date.getTime())) return null

  if (typeof dateInput === 'string' && dateInput.includes('T') && !dateInput.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateInput)) {
    const utcDate = new Date(`${dateInput}Z`)
    if (!isNaN(utcDate.getTime()) && utcDate.getTime() <= Date.now() + 3600000) {
      date = utcDate
    }
  }

  return date
}

export const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return 'N/A'
  
  const date = parseApiDate(dateStr)
  if (!date) return dateStr

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`
}
