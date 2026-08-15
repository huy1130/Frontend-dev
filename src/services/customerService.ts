import axiosClient from '../api/axiosClient';

export interface VehicleResponseDTO {
    vehicleId: number;
    licensePlate: string;
    vehicleType: string;
    qrCode?: string;
}

export interface AddVehicleRequestDTO {
    licensePlate: string;
    vehicleType: string;
}

export const customerService = {
  getMyVehicles: (): Promise<{ success?: boolean; data: VehicleResponseDTO[] }> => {
    return axiosClient.get('/Customer/my-vehicles');
  },
  addVehicle: (data: AddVehicleRequestDTO): Promise<{ success?: boolean; message?: string; data?: VehicleResponseDTO }> => {
    return axiosClient.post('/Customer/vehicles', data);
  }
};
