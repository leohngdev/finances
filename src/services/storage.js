import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDefaultStore } from "./domain";

export const STORE_KEY = "@logit/store/v1";

export function normalizeStore(raw) {
  const defaults = createDefaultStore();
  if (!raw || typeof raw !== "object") return defaults;
  const incoming = raw.settings || {};
  const settings = { ...defaults.settings, ...incoming };
  delete settings.weekdayRate;
  delete settings.saturdayRate;
  delete settings.sundayRate;
  delete settings.nightRate;
  delete settings.taxPercent;
  delete settings.hourlyRate;
  delete settings.overtimeEnabled;
  delete settings.overtimeAfterHours;
  delete settings.overtimeMultiplier;
  if (!settings.headerRate) settings.headerRate = defaults.settings.headerRate;
  if (!settings.headerRateFrom) settings.headerRateFrom = defaults.settings.headerRateFrom;
  if (!settings.previousHeaderRate) settings.previousHeaderRate = defaults.settings.previousHeaderRate;
  if (!settings.saturdayLoading) settings.saturdayLoading = defaults.settings.saturdayLoading;
  if (!settings.sundayLoading) settings.sundayLoading = defaults.settings.sundayLoading;
  if (!settings.nightLoading) settings.nightLoading = defaults.settings.nightLoading;
  if (!settings.superPercent) settings.superPercent = defaults.settings.superPercent;
  const paygOverrides =
    raw.paygOverrides && typeof raw.paygOverrides === "object" && !Array.isArray(raw.paygOverrides)
      ? raw.paygOverrides
      : {};
  return {
    settings,
    shifts: Array.isArray(raw.shifts) ? raw.shifts : [],
    payments: Array.isArray(raw.payments) ? raw.payments : [],
    paygOverrides,
  };
}

export async function loadStore() {
  const raw = await AsyncStorage.getItem(STORE_KEY);
  if (!raw) return createDefaultStore();
  try {
    return normalizeStore(JSON.parse(raw));
  } catch (err) {
    const error = new Error("Couldn't read your saved hours.");
    error.cause = err;
    throw error;
  }
}

export async function saveStore(store) {
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(store));
}
