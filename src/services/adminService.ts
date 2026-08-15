import axiosClient from '../api/axiosClient';

export interface CreateStaffRequestDTO {
  fullName: string;
  phoneNumber: string;
  password?: string;
  role?: string;
}

export interface UserDto {
  id: number;
  fullName: string;
  phoneNumber: string;
  role: string;
  tier?: string | null;
  createdAt?: string | null;
}

export interface UserListResponseDTO {
  admins: UserDto[];
  staffs: UserDto[];
  customers: UserDto[];
}

export const adminService = {
  createStaff: (data: CreateStaffRequestDTO): Promise<any> => {
    return axiosClient.post('/Admin/staff', data);
  },
  getUsers: (): Promise<{ success?: boolean; data?: UserListResponseDTO }> => {
    return axiosClient.get('/Admin/users');
  }
};
