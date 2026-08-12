import axiosClient from '../api/axiosClient';

export interface BookingRequestDTO {
    customerId?: number;
    vehicleId?: number;
    guestName?: string;
    guestPhone?: string;
    guestLicensePlate?: string;
    guestVehicleType?: string;
    serviceId: number;
    slotId: number;
    bookingDate: string;
    promotionId?: number | null;
}

export interface BookingResponseDTO {
    bookingId: number;
    customerId?: number;
    customerName?: string;
    vehicleId?: number;
    licensePlate: string;
    vehicleType?: string;
    serviceId: number;
    serviceName: string;
    slotId: number;
    startTime: string;
    endTime: string;
    bookingDate: string;
    originalPrice?: number;
    finalPrice?: number;
    promotionId?: number | null;
    status: string;
    createdAt?: string;
}

export const bookingService = {
  createBooking: (data: BookingRequestDTO): Promise<any> => {
    return axiosClient.post('/Booking', data);
  },
  
  getBookingHistory: (phone: string): Promise<{ success: boolean; data: BookingResponseDTO[] }> => {
    return axiosClient.get(`/Booking/search?phone=${phone}`);
  }
};
