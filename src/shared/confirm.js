import { Alert, Platform } from "react-native";

export function confirmAction({ title, message, confirmLabel = "OK", destructive, onConfirm }) {
  if (Platform.OS === "web") {
    const text = [title, message].filter(Boolean).join("\n");
    if (typeof window !== "undefined" && window.confirm(text)) onConfirm();
    return;
  }
  Alert.alert(title, message || "", [
    { text: "Cancel", style: "cancel" },
    {
      text: confirmLabel,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}
