import axiosClient from '../api/axiosClient'

export interface TodayBookingDto {
  bookingId: number
  customerName: string
  customerPhone: string
  licensePlate: string
  vehicleType: string
  status: string
  slotId: number
  serviceId: number
  serviceName?: string
  bookingDate: string
  startTime?: string
  endTime?: string
}

export interface IssueReceiptRequestDTO {
  bookingId: number
  isCustomerLeaving: boolean
  customerSignature?: string | null
}

export const staffService = {
  // Get all bookings for today
  getTodayBookings: async (): Promise<TodayBookingDto[]> => {
    const response = await axiosClient.get('/Staff/today-bookings')
    return response.data
  },

  // Confirm a booking
  confirmBooking: async (bookingId: number): Promise<any> => {
    const response = await axiosClient.post('/Staff/confirm', { bookingId })
    return response
  },

  // Check-in a vehicle
  checkInBooking: async (data: FormData): Promise<any> => {
    const response = await axiosClient.post('/Staff/check-in', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  // Issue parking receipt
  issueReceipt: async (data: IssueReceiptRequestDTO): Promise<any> => {
    const response = await axiosClient.post('/Staff/issue-receipt', data)
    return response
  },

  // Check-out a vehicle
  checkOutBooking: async (bookingId: number): Promise<any> => {
    const response = await axiosClient.post('/Staff/check-out', { bookingId })
    return response
  },
}
