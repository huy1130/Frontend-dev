import axiosClient from '../api/axiosClient';

export interface BookingRequestDTO {
    vehicleId: number;
    serviceId: number;
    slotId: number;
    promotionId?: number | null;
}

export const bookingService = {
  createBooking: (data: BookingRequestDTO): Promise<{ success: boolean; message: string; bookingId: number }> => {
    return axiosClient.post('/Booking', data);
  }
};
