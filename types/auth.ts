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
