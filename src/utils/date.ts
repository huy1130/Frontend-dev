export const getLocalDateString = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return 'N/A'
  const hasTimezone = dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('T') && dateStr.slice(11).includes('-'))
  const isoStr = !hasTimezone ? `${dateStr}Z` : dateStr
  const date = new Date(isoStr)
  return isNaN(date.getTime()) ? dateStr : date.toLocaleString('vi-VN')
}
