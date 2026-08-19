import axiosClient from '../api/axiosClient';

export interface TimeSlotDto {
    slotId: number;
    startTime: string;
    endTime: string;
    carCapacity: number;
    bikeCapacity: number;
    isActive: boolean;
    createdAt?: string;
}

export interface CreateTimeSlotDto {
    startTime: string;
    endTime: string;
    carCapacity: number;
    bikeCapacity: number;
}

export interface AvailableSlotDto {
    slotId: number;
    startTime: string;
    endTime: string;
    carCapacity: number;
    bikeCapacity: number;
    carBookedCount: number;
    bikeBookedCount: number;
    remainingCarCapacity: number;
    remainingBikeCapacity: number;
}

export interface UpdateTimeSlotDto {
    startTime?: string;
    endTime?: string;
    carCapacity?: number;
    bikeCapacity?: number;
    isActive?: boolean;
}

export const timeSlotService = {
  getAllTimeSlots: (): Promise<TimeSlotDto[]> => {
    return axiosClient.get('/TimeSlots');
  },
  
  createTimeSlot: (data: CreateTimeSlotDto): Promise<TimeSlotDto> => {
    return axiosClient.post('/TimeSlots', data);
  },

  getAvailableSlots: (date: string): Promise<AvailableSlotDto[]> => {
    return axiosClient.get(`/TimeSlots/available?date=${date}`);
  },

  getTimeSlotById: (id: number): Promise<TimeSlotDto> => {
    return axiosClient.get(`/TimeSlots/${id}`);
  },

  updateTimeSlot: (id: number, data: UpdateTimeSlotDto): Promise<any> => {
    return axiosClient.put(`/TimeSlots/${id}/status`, data);
  },

  toggleSlotStatus: (id: number, isActive: boolean): Promise<any> => {
    return axiosClient.put(`/TimeSlots/${id}/status`, { isActive });
  }
};
