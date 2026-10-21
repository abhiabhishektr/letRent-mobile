import { Platform } from "react-native";
import type { ViewStyle } from "react-native";

type ShadowOffset = NonNullable<ViewStyle["shadowOffset"]>;

interface PlatformShadowOptions {
  color: string;
  opacity: number;
  radius: number;
  offset?: ShadowOffset;
  elevation?: number;
  android?: ViewStyle;
}

function colorWithOpacity(color: string, opacity: number): string {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color);
  if (!match) {
    throw new Error(`Unsupported shadow color format: ${color}`);
  }

  const hex =
    match[1].length === 3
      ? match[1].replace(/./g, (digit) => `${digit}${digit}`)
      : match[1];
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

export function createPlatformShadow({
  color,
  opacity,
  radius,
  offset = { width: 0, height: 0 },
  elevation,
  android,
}: PlatformShadowOptions): ViewStyle {
  if (Platform.OS === "web") {
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px ${colorWithOpacity(color, opacity)}`,
    };
  }

  const nativeShadow: ViewStyle = {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: offset,
  };

  if (Platform.OS === "android" && android) {
    return android;
  }

  if (Platform.OS === "android" && elevation !== undefined) {
    return { ...nativeShadow, elevation };
  }

  return nativeShadow;
}
