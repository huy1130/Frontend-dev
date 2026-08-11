import axiosClient from '../api/axiosClient';

export interface CreateStaffRequestDTO {
  fullName: string;
  phoneNumber: string;
  password?: string;
  role?: string;
}

export const adminService = {
  createStaff: (data: CreateStaffRequestDTO): Promise<any> => {
    return axiosClient.post('/Admin/staff', data);
  }
};
