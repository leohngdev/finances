import { Platform } from "react-native";
import { formatISODate } from "../services/domain";

export function canUseFileBackup() {
  return Platform.OS === "web" && typeof document !== "undefined";
}

export function downloadBackup(store) {
  if (!canUseFileBackup()) return;
  const json = JSON.stringify(store, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `logit-${formatISODate(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function pickBackupFile() {
  return new Promise((resolve, reject) => {
    if (!canUseFileBackup()) {
      reject(new Error("Backup files work in the website."));
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) {
        reject(new Error("No file picked."));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (!parsed || typeof parsed !== "object") throw new Error("bad");
          resolve(parsed);
        } catch {
          reject(new Error("That file isn’t a Logit backup."));
        }
      };
      reader.onerror = () => reject(new Error("Couldn’t read that file."));
      reader.readAsText(file);
    };
    input.click();
  });
}
