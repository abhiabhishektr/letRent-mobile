import { apiClient, getErrorMessage } from "./api";
import { tokenStorage } from "./tokenStorage";

export type TenancyFrequency = "DAILY" | "MONTHLY" | "YEARLY";

export type TenantInvitationInput = {
  property_id: number;
  mobile_number: string;
  name: string;
  room_number?: string;
  rent_amount: string;
  frequency: TenancyFrequency;
  first_due_date: string;
  send_sms: boolean;
};

export async function createTenantInvitation(
  payload: TenantInvitationInput,
): Promise<unknown> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required. Please log in again.");
  }

  try {
    const response = await apiClient.post(
      "/api/tenancies/tenant-invitations/",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to add tenant."));
  }
}
