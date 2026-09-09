import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { AppMode, User } from "../types/user";
import { storage } from "../services/storage";

type AuthContextValue = {
  currentUser: User | null;
  isLoading: boolean;
  pendingPhone: string;
  mode: AppMode;
  beginLogin: (phone: string) => void;
  verifyOtp: (otp: string) => Promise<void>;
  switchMode: (mode: AppMode) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = "letrent_session";
export const FIXED_OTP = "123456";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingPhone, setPendingPhone] = useState("98765 43210");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    storage
      .get<User>(SESSION_KEY)
      .then(setCurrentUser)
      .finally(() => setIsLoading(false));
  }, []);
  const beginLogin = (phone: string) => {
    setPendingPhone(phone);
    router.push("/otp");
  };
  const verifyOtp = async (otp: string) => {
    if (otp !== FIXED_OTP) throw new Error("Enter the demo OTP: 123456");
    const user: User = {
      id: "demo-user",
      name: "Rahul",
      phone: pendingPhone,
      mode: "tenant",
    };
    await storage.set(SESSION_KEY, user);
    setCurrentUser(user);
    router.replace("/tenant");
  };
  const switchMode = async (mode: AppMode) => {
    if (!currentUser) return;
    const user = { ...currentUser, mode };
    await storage.set(SESSION_KEY, user);
    setCurrentUser(user);
    router.replace(mode === "tenant" ? "/tenant" : "/owner");
  };
  const logout = async () => {
    await storage.remove(SESSION_KEY);
    setCurrentUser(null);
    router.replace("/");
  };
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        pendingPhone,
        mode: currentUser?.mode ?? "tenant",
        beginLogin,
        verifyOtp,
        switchMode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
