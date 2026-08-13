import axiosClient from '@/api/axiosClient';
import { 
  LoginRequestDTO, 
  RegisterRequestDTO, 
  AuthResponseDTO,
  ForgotPasswordRequestDTO,
  ResetPasswordRequestDTO 
} from '@/types/auth';

export const authService = {
  login: (data: LoginRequestDTO): Promise<AuthResponseDTO> => {
    return axiosClient.post('/Auth/login', data);
  },

  register: (data: RegisterRequestDTO): Promise<AuthResponseDTO> => {
    return axiosClient.post('/Auth/register', data);
  },

  forgotPassword: (data: ForgotPasswordRequestDTO): Promise<{ success: boolean; message: string; otp?: string }> => {
    return axiosClient.post('/Auth/forgot-password', data);
  },

  resetPassword: (data: ResetPasswordRequestDTO): Promise<{ success: boolean; message: string }> => {
    return axiosClient.post('/Auth/reset-password', data);
  }
};
