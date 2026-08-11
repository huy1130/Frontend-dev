import axiosClient from '@/api/axiosClient';
import { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '@/types/auth';

export const authService = {
  login: (data: LoginRequestDTO): Promise<AuthResponseDTO> => {
    return axiosClient.post('/Auth/login', data);
  },

  register: (data: RegisterRequestDTO): Promise<AuthResponseDTO> => {
    return axiosClient.post('/Auth/register', data);
  },
};
