import axiosClient from '../api/axiosClient';

export interface BookingAddOnDTO {
    bookingAddOnId: number;
    serviceId: number;
    serviceName: string;
    promotionId?: number | null;
    redemptionId?: number | null;
    originalPrice: number;
    finalPrice: number;
    status: string;
}

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
    redemptionId?: number | null;
}

export interface AppliedRewardDTO {
    redemptionId: number;
    rewardId: number;
    rewardName: string;
    rewardType: string;
    description?: string | null;
    pointsSpent: number;
    discountValue?: number | null;
    serviceId?: number | null;
    serviceName?: string | null;
    status: string;
    redeemedAt: string;
    usedAt?: string | null;
}

export interface ParkingReceiptDTO {
    receiptId: number;
    bookingId: number;
    issueStaffId?: number | null;
    issueStaffName?: string | null;
    status: string;
    issuedAt?: string | null;
    isCustomerLeaving: boolean;
    customerSignature?: string | null;
}

export interface BookingResponseDTO {
    bookingId: number;
    customerId?: number;
    customerName?: string;
    customerPhone?: string;
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
    depositAmount?: number | null;
    promotionId?: number | null;
    promoCode?: string | null;
    redemptionId?: number | null;
    rewardName?: string | null;
    appliedReward?: AppliedRewardDTO | null;
    addOns?: BookingAddOnDTO[];
    qrCode?: string;
    status: string;
    incidentImage1?: string | null;
    incidentImage2?: string | null;
    incidentImage1ApiPath?: string | null;
    incidentImage2ApiPath?: string | null;
    staffNote?: string | null;
    parkingReceipt?: ParkingReceiptDTO | null;
    createdAt?: string;
}

export interface PlateRecognitionResultDTO {
    detectedPlate?: string | null;
    bookings?: BookingResponseDTO[];
}

export const bookingService = {
  createBooking: (data: BookingRequestDTO): Promise<any> => {
    return axiosClient.post('/Booking', data);
  },
  
  getBookingHistory: (phone: string): Promise<{ success: boolean; data: BookingResponseDTO[] }> => {
    return axiosClient.get(`/Booking/search?phone=${phone}`);
  },

  getBookingByLicensePlate: (licensePlate: string): Promise<{ success: boolean; data: BookingResponseDTO[] }> => {
    return axiosClient.get(`/Booking/search-by-plate?licensePlate=${licensePlate}`);
  },
  
  getBookingByQrCode: (qrCode: string): Promise<{ success: boolean; data: any }> => {
    return axiosClient.get(`/Booking/checkin/${qrCode}`);
  },

  scanPlate: (file: File): Promise<{ success: boolean; data?: PlateRecognitionResultDTO; message?: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosClient.post('/Booking/scan-plate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Admin Methods
  getAdminBookings: (date?: string): Promise<{ success: boolean; data: { items: BookingResponseDTO[] } }> => {
    const url = date ? `/Booking/admin?date=${date}` : `/Booking/admin`;
    return axiosClient.get(url);
  },
  
  updateBookingStatus: (bookingId: number, status: string): Promise<any> => {
    return axiosClient.put(`/Booking/${bookingId}/status?status=${status}`);
  },
  
  getBookingDetail: (bookingId: number): Promise<{ success: boolean; data: any }> => {
    return axiosClient.get(`/Booking/${bookingId}`);
  }
};
