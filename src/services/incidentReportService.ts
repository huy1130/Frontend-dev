import axiosClient from '../api/axiosClient'

export interface IncidentReportDto {
  reportId: number
  bookingId: number
  customerId?: number | null
  customerName?: string | null
  image1?: string | null
  image2?: string | null
  image3?: string | null
  image4?: string | null
  image5?: string | null
  image1ApiPath?: string | null
  image2ApiPath?: string | null
  image3ApiPath?: string | null
  image4ApiPath?: string | null
  image5ApiPath?: string | null
  customerNote: string
  status: string // 'Pending' | 'InReview' | 'Resolved' | 'Rejected'
  managerNote?: string | null
  createdAt?: string | null
  resolvedAt?: string | null
  managerContactPhone?: string | null
  managerContactEmail?: string | null
}

export interface ResolveIncidentReportDto {
  status: string
  managerNote?: string | null
}

export const incidentReportService = {
  // Khách hàng gửi báo cáo sự cố (dùng FormData chứa BookingId, CustomerNote, Image1, Image2)
  createReport: async (formData: FormData): Promise<{ success: boolean; data?: IncidentReportDto; message?: string }> => {
    const response = await axiosClient.post('/IncidentReport', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data || response
  },

  // Khách hàng xem danh sách sự cố của mình
  getMyReports: async (): Promise<{ success: boolean; data?: IncidentReportDto[] }> => {
    const response = await axiosClient.get('/IncidentReport/my-reports')
    return response.data || response
  },

  // Staff / Admin xem toàn bộ báo cáo sự cố
  getAllReports: async (): Promise<{ success: boolean; data?: IncidentReportDto[] }> => {
    const response = await axiosClient.get('/IncidentReport/admin/all')
    return response.data || response
  },

  // Staff / Admin xử lý sự cố (chuyển trạng thái InReview / Resolved / Rejected + ManagerNote)
  resolveReport: async (id: number, data: ResolveIncidentReportDto): Promise<{ success: boolean; data?: IncidentReportDto; message?: string }> => {
    const response = await axiosClient.put(`/IncidentReport/admin/${id}/resolve`, data)
    return response.data || response
  },
}
