export type UserStatus = string;

export interface UserSummaryDTO {
  id: string;
  email: string;
  role: string;
  status: string;
  handle: string;
  fullName: string;
  avatarUrl: string;
}

export interface AdminUserDTO {
  id: string;
  email: string;
  role: string;
  status: string;
  authProvider: string;
  registeredAt: string;
  profileHandle: string;
  fullName: string;
}

export interface UpdateUserStatusDTO {
  status: string;
}

export interface UpdateUserRoleDTO {
  role: string;
}

export interface RegistrationDTO {
  fullName: string;
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password: string;
  recaptchaToken?: string;
}

export type LoginData = LoginDTO;

export interface User extends UserSummaryDTO {}

export type AuthResponse = string;
