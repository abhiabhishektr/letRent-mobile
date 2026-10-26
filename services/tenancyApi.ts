import { API_BASE_URL, apiClient, getErrorMessage } from "./api";
import { tokenStorage } from "./tokenStorage";

export type TenancyFrequency = "DAILY" | "MONTHLY" | "YEARLY";

export type PendingTenantInvitation = {
  id: number;
  property: number;
  property_name: string;
  mobile_number: string;
  name: string;
  room_number: string;
  rent_amount: string;
  frequency: string;
  first_due_date: string;
  next_due_date?: string | null;
  remarks?: string;
  status: string;
  expires_at?: string | null;
  accepted_at?: string | null;
  rejected_at?: string | null;
  reject_remarks?: string;
  created_at?: string;
};

type PendingInvitationPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PendingTenantInvitation[];
};

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

export async function getPendingTenantInvitations(): Promise<PendingInvitationPage> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required. Please log in again.");
  }

  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const visitedPages = new Set<string>();
  let nextUrl: string | null = "/api/tenancies/tenant-invitations/my-pending/";
  let count = 0;
  let isFirstPage = true;
  const results: PendingTenantInvitation[] = [];
  const apiOrigin = new URL(API_BASE_URL).origin;
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  let requestBase = baseUrl;

  try {
    while (nextUrl) {
      const requestUrl: URL = new URL(nextUrl, requestBase);
      if (requestUrl.origin !== apiOrigin) {
        throw new Error("The invitation service returned an invalid page link.");
      }
      if (visitedPages.has(requestUrl.toString())) {
        throw new Error("The invitation service returned a repeated page link.");
      }
      visitedPages.add(requestUrl.toString());

      const response: { data: PendingInvitationPage } =
        await apiClient.get<PendingInvitationPage>(
          requestUrl.toString(),
          config,
        );
      const page: PendingInvitationPage = response.data;
      if (
        !page ||
        typeof page.count !== "number" ||
        !Array.isArray(page.results) ||
        (page.next !== null && typeof page.next !== "string")
      ) {
        throw new Error("The invitation service returned an invalid response.");
      }

      if (isFirstPage) {
        count = page.count;
        isFirstPage = false;
      }
      results.push(...page.results);
      nextUrl = page.next;
      requestBase = requestUrl.toString();
    }

    return { count, next: null, previous: null, results };
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to load pending invitations."),
    );
  }
}

export async function acceptTenantInvitation(invitationId: number): Promise<void> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required. Please log in again.");
  }

  try {
    await apiClient.post(
      `/api/tenancies/tenant-invitations/${invitationId}/accept/`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to accept this invitation."),
    );
  }
}

export async function rejectTenantInvitation(
  invitationId: number,
  rejectRemarks: string,
): Promise<void> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required. Please log in again.");
  }

  try {
    await apiClient.post(
      `/api/tenancies/tenant-invitations/${invitationId}/reject/`,
      { reject_remarks: rejectRemarks },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to reject this invitation."),
    );
  }
}

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
