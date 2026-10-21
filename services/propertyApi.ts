import { apiClient, getErrorMessage } from "./api";
import { tokenStorage } from "./tokenStorage";

export type PropertyTypeValue = 1 | 2 | 3 | 5 | 6;

export const PROPERTY_TYPE_OPTIONS: { value: PropertyTypeValue; label: string; icon: string; description: string }[] = [
  { value: 1, label: "Residential", icon: "🏠", description: "Apartment, House, Villa, etc." },
  { value: 2, label: "Commercial", icon: "🏬", description: "Office, Shop, Showroom, etc." },
  { value: 3, label: "Hostel", icon: "🏢", description: "PG, Paying Guest, Co-living" },
  { value: 5, label: "Agricultural", icon: "🌾", description: "Farm, Land, Plantation, etc." },
  { value: 6, label: "Other", icon: "⋯", description: "Any other property type" },
];

export const PROPERTY_TYPE_LABELS = Object.fromEntries(
  PROPERTY_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<PropertyTypeValue, string>;

export const parsePropertyType = (value?: string | number | (string | number)[]): PropertyTypeValue => {
  const raw = Number(Array.isArray(value) ? value[0] : value);
  return PROPERTY_TYPE_OPTIONS.some((o) => o.value === raw) ? (raw as PropertyTypeValue) : 1;
};

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

export async function getProperties(): Promise<PropertyResponse[]> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required. Please log in again.");
  }

  try {
    const response = await apiClient.get("/api/properties/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = response.data as PropertyResponse[] | undefined;
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    const message = getErrorMessage(error, "Unable to load properties.");
    throw new Error(message);
  }
}

export async function getProperty(id: number | string): Promise<PropertyResponse> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required. Please log in again.");
  }

  try {
    const response = await apiClient.get(`/api/properties/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data as PropertyResponse;
  } catch (error) {
    const message = getErrorMessage(error, "Unable to load property.");
    throw new Error(message);
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

export async function updateProperty(
  id: number | string,
  payload: Partial<PropertyCreateInput>,
): Promise<PropertyResponse> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required. Please log in again.");
  }

  try {
    const response = await apiClient.patch(`/api/properties/${id}/`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data as PropertyResponse;
  } catch (error) {
    const message = getErrorMessage(error, "Unable to update property.");
    throw new Error(message);
  }
}

export async function deleteProperty(id: number | string): Promise<void> {
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required. Please log in again.");
  }

  try {
    await apiClient.delete(`/api/properties/${id}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    const message = getErrorMessage(error, "Unable to delete property.");
    throw new Error(message);
  }
}
