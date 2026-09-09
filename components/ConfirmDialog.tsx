import { Alert } from "react-native";
export function confirmDelete(name: string, onConfirm: () => void) {
  Alert.alert("Delete user", `Are you sure you want to delete ${name}?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}
