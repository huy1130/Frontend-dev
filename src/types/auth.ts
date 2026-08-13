export interface LoginRequestDTO {
  phoneNumber?: string;
  password?: string;
}

export interface RegisterRequestDTO {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  licensePlate?: string;
  vehicleType?: string;
}

export interface AuthResponseDTO {
  token: string;
  fullName: string;
  role: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  email: string;
  otp: string;
  newPassword: string;
}
