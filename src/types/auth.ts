export interface LoginRequestDTO {
  phoneNumber?: string;
  password?: string;
}

export interface RegisterRequestDTO {
  fullName?: string;
  phoneNumber?: string;
  password?: string;
}

export interface AuthResponseDTO {
  token: string;
  fullName: string;
  role: string;
}
