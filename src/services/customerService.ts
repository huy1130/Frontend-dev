import axiosClient from '../api/axiosClient';

export interface VehicleResponseDTO {
    vehicleId: number;
    licensePlate: string;
    vehicleType: string;
    qrCode?: string;
}

export const customerService = {
  getMyVehicles: (): Promise<{ success: boolean; data: VehicleResponseDTO[] }> => {
    return axiosClient.get('/Customer/my-vehicles');
  }
};
