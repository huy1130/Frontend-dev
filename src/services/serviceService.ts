import axiosClient from '../api/axiosClient';

export interface ServiceDto {
    serviceId: number;
    serviceName: string;
    description?: string;
    price: number;
    isActive?: boolean;
}

export interface UpsertServiceDto {
    serviceName: string;
    description?: string;
    price: number;
}

export const serviceService = {
  // Public/Customer endpoint
  getActiveServices: (): Promise<ServiceDto[]> => {
    return axiosClient.get('/Services');
  },
  
  // Admin endpoints
  getAllAdminServices: (): Promise<ServiceDto[]> => {
    return axiosClient.get('/admin/services');
  },

  createService: (data: UpsertServiceDto): Promise<ServiceDto> => {
    return axiosClient.post('/admin/services', data);
  },

  updateService: (id: number, data: UpsertServiceDto): Promise<void> => {
    return axiosClient.put(`/admin/services/${id}`, data);
  },

  deactivateService: (id: number): Promise<void> => {
    return axiosClient.patch(`/admin/services/${id}/deactivate`);
  }
};
