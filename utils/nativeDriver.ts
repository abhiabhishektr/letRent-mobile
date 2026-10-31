import { Platform } from "react-native";

// react-native-web has no native animated module; use the native driver everywhere else.
export const USE_NATIVE_DRIVER = Platform.OS !== "web";
