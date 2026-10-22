import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// expo-secure-store has no web implementation, so fall back to localStorage there.
const store = {
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return globalThis.localStorage?.getItem(key) ?? null;
    }
    return store.get(key);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === "web") {
      globalThis.localStorage?.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const ACCESS_TOKEN_KEY = "letrent_access_token";
const REFRESH_TOKEN_KEY = "letrent_refresh_token";

export const tokenStorage = {
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      store.set(ACCESS_TOKEN_KEY, accessToken),
      store.set(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return store.get(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return store.get(REFRESH_TOKEN_KEY);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      store.remove(ACCESS_TOKEN_KEY),
      store.remove(REFRESH_TOKEN_KEY),
    ]);
  },
};
