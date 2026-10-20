import { apiClient, getErrorMessage } from "./api";
import type {
  ResendOtpResponse,
  SendOtpResponse,
  VerifyOtpResponse,
  GoogleAuthResponse,
} from "../types/auth";

function toFormData(data: Record<string, string | number | boolean | undefined | null>) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
}

function assertSuccess<T extends { success?: boolean; message?: string }>(
  payload: T,
  fallback: string,
): T {
  if (payload && payload.success === false) {
    throw new Error(payload.message || fallback);
  }

  return payload;
}

export const authApi = {
  async googleLogin(
    idToken: string,
    googleAccessToken: string,
  ): Promise<GoogleAuthResponse> {
    try {
      const response = await apiClient.post(
        "/api/auth/google/",
        { id_token: idToken },
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return assertSuccess(
        response.data as GoogleAuthResponse,
        "Google sign-in failed.",
      );
    } catch (error) {
      throw new Error(getErrorMessage(error, "Google sign-in failed."));
    }
  },

  async sendOtp(mobileNumber: string): Promise<SendOtpResponse> {
    try {
      const response = await apiClient.post(
        "/api/auth/send-otp/",
        toFormData({ mobile_number: mobileNumber }),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return assertSuccess(response.data as SendOtpResponse, "Unable to send OTP.");
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to send OTP."));
    }
  },

  async verifyOtp(mobileNumber: string, otp: string): Promise<VerifyOtpResponse> {
    try {
      const response = await apiClient.post(
        "/api/auth/verify-otp/",
        toFormData({ mobile_number: mobileNumber, otp }),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const payload = response.data as VerifyOtpResponse;
      if (payload && payload.success === false) {
        throw new Error(payload.message || "OTP verification failed.");
      }

      return payload;
    } catch (error) {
      throw new Error(getErrorMessage(error, "OTP verification failed."));
    }
  },

  async resendOtp(mobileNumber: string): Promise<ResendOtpResponse> {
    try {
      const response = await apiClient.post(
        "/api/auth/resend-otp/",
        toFormData({ mobile_number: mobileNumber }),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const payload = response.data as ResendOtpResponse;
      if (payload && payload.success === false) {
        throw new Error(payload.message || "Unable to resend OTP.");
      }

      return payload;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to resend OTP."));
    }
  },
};
