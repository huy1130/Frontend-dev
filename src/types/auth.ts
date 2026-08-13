export interface LoginRequestDTO {
  phoneNumber?: string;
  password?: string;
}

export interface RegisterRequestDTO {
  fullName?: string;
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
  phoneNumber: string;
}

export interface ResetPasswordRequestDTO {
  phoneNumber: string;
  otp: string;
  newPassword: string;
}
