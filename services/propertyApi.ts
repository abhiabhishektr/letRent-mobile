import { apiClient, getErrorMessage } from "./api";
import { tokenStorage } from "./tokenStorage";

export type PropertyTypeValue = "HOSTEL" | "RESIDENTIAL" | "RENTAL_ITEM" | "OTHER";

export type PropertyCreateInput = {
  name: string;
  property_type: PropertyTypeValue;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type PropertyResponse = {
  id: number | string;
  name: string;
  property_type: PropertyTypeValue;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PostOfficeEntry = {
  District?: string;
  State?: string;
  Name?: string;
  Pincode?: string;
};

export async function lookupPinCode(
  pincode: string,
): Promise<{ city: string; state: string }> {
  const trimmed = pincode.trim();
  if (!/^\d{6}$/.test(trimmed)) {
    throw new Error("We couldn't find this PIN code.");
  }

  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${trimmed}`,
    );
    const payload = (await response.json()) as Array<{
      Status?: string;
      Message?: string;
      PostOffice?: PostOfficeEntry[];
    }>;

    const office = payload[0]?.PostOffice?.[0];
    if (!office || !office.District || !office.State) {
      throw new Error("We couldn't find this PIN code.");
    }

    return {
      city: office.District,
      state: office.State,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("PIN code")) {
      throw error;
    }

    throw new Error("Unable to fetch location. Please check your internet connection and try again.");
  }
}

export async function createProperty(
  payload: PropertyCreateInput,
): Promise<PropertyResponse> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required. Please log in again.");
  }

  try {
    const response = await apiClient.post("/api/properties/", payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data as PropertyResponse;
  } catch (error) {
    const message = getErrorMessage(error, "Unable to add property.");
    throw new Error(message);
  }
}
