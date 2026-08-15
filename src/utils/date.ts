export const getLocalDateString = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return 'N/A'
  
  let date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  // Kiểm tra nếu dateStr là chuỗi ISO không có định danh múi giờ (Z hay +HH:MM):
  // Nếu ép sang UTC mà thời gian tạo không bị đẩy vào tương lai quá 1 giờ so với hiện tại,
  // thì đó là thời gian UTC chuẩn. Ngược lại (bị nhảy sang tương lai như 21h đêm),
  // chứng tỏ nó đã được lưu dưới dạng giờ địa phương (getdate() của SQL Server).
  if (typeof dateStr === 'string' && dateStr.includes('T') && !dateStr.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
    const utcDate = new Date(`${dateStr}Z`)
    if (!isNaN(utcDate.getTime()) && utcDate.getTime() <= Date.now() + 3600000) {
      date = utcDate
    }
  }

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`
}
