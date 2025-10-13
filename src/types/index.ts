export interface User {
  cp050: string; // login
  cp064: string; // password
  cp010: number; // company_id
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreateInput {
  cp050: string;
  cp064: string;
  cp010: number;
}

export interface UserUpdateInput {
  cp050?: string;
  cp064?: string;
  cp010?: number;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      cp050: string;
      cp010: number;
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface JwtPayload {
  cp050: string;
  cp010: number;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    cp050: string;
    cp010: number;
  };
}
