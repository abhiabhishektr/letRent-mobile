export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  is_new_user?: boolean;
  onboarding_completed?: boolean;
  user?: {
    id: string;
    user_id?: string;
    mobile_number: string;
    name: string;
  };
  tokens?: {
    access: string;
    refresh: string;
  };
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  resend_after: number;
}

export interface GoogleAuthResponse {
  success?: boolean;
  message?: string;
  user?: {
    id?: string | number;
    user_id?: string | number;
    mobile_number?: string;
    name?: string;
    email?: string;
  };
  tokens?: {
    access?: string;
    refresh?: string;
  };
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
}
