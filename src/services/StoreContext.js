import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createId,
  createDefaultStore,
  findOpenShift,
} from "./domain";
import { loadStore, normalizeStore, saveStore } from "./storage";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [store, setStore] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const next = await loadStore();
      setStore(next);
      setLoadError(null);
    } catch (err) {
      setStore(createDefaultStore());
      setLoadError(err.message || "Couldn’t load your saved hours.");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const persist = useCallback(async (next) => {
    setStore(next);
    try {
      await saveStore(next);
      setSaveError(null);
    } catch (err) {
      setSaveError(err.message || "Couldn’t save. The last change is only on screen for now.");
    }
  }, []);

  const clockIn = useCallback(
    async (when = new Date()) => {
      if (!store) return;
      if (findOpenShift(store.shifts)) return;
      const shift = {
        id: createId("shift"),
        clockIn: when.toISOString(),
        clockOut: null,
      };
      await persist({ ...store, shifts: [shift, ...store.shifts] });
    },
    [persist, store]
  );

  const clockOut = useCallback(
    async (when = new Date()) => {
      if (!store) return;
      const open = findOpenShift(store.shifts);
      if (!open) return;
      const clockOutISO = when.toISOString();
      if (new Date(clockOutISO) <= new Date(open.clockIn)) return;
      await persist({
        ...store,
        shifts: store.shifts.map((shift) =>
          shift.id === open.id ? { ...shift, clockOut: clockOutISO } : shift
        ),
      });
    },
    [persist, store]
  );

  const upsertShift = useCallback(
    async (draft) => {
      if (!store) return;
      const clockInISO = new Date(draft.clockIn).toISOString();
      const clockOutISO = draft.clockOut ? new Date(draft.clockOut).toISOString() : null;
      if (clockOutISO && new Date(clockOutISO) <= new Date(clockInISO)) {
        throw new Error("Clock out has to be after clock in.");
      }
      const existing = draft.id ? store.shifts.find((shift) => shift.id === draft.id) : null;
      if (!existing && findOpenShift(store.shifts) && !clockOutISO) {
        throw new Error("You’re already clocked in. Clock out, or edit that shift.");
      }
      const publicHoliday = Boolean(draft.publicHoliday);
      if (existing) {
        await persist({
          ...store,
          shifts: store.shifts.map((shift) => {
            if (shift.id !== existing.id) return shift;
            const next = { ...shift, clockIn: clockInISO, clockOut: clockOutISO };
            if (publicHoliday) next.publicHoliday = true;
            else delete next.publicHoliday;
            return next;
          }),
        });
        return;
      }
      const shift = { id: createId("shift"), clockIn: clockInISO, clockOut: clockOutISO };
      if (publicHoliday) shift.publicHoliday = true;
      await persist({
        ...store,
        shifts: [shift, ...store.shifts],
      });
    },
    [persist, store]
  );

  const deleteShift = useCallback(
    async (id) => {
      if (!store) return;
      await persist({
        ...store,
        shifts: store.shifts.filter((shift) => shift.id !== id),
      });
    },
    [persist, store]
  );

  const markPaid = useCallback(
    async (fortnightId, amount) => {
      if (!store) return;
      const payments = store.payments.filter((payment) => payment.fortnightId !== fortnightId);
      payments.push({
        fortnightId,
        amount: Number(amount) || 0,
        paidAt: new Date().toISOString(),
      });
      await persist({ ...store, payments });
    },
    [persist, store]
  );

  const markUnpaid = useCallback(
    async (fortnightId) => {
      if (!store) return;
      await persist({
        ...store,
        payments: store.payments.filter((payment) => payment.fortnightId !== fortnightId),
      });
    },
    [persist, store]
  );

  const setPaygOverride = useCallback(
    async (fortnightId, value) => {
      if (!store) return;
      const paygOverrides = { ...(store.paygOverrides || {}) };
      const trimmed = String(value ?? "").trim();
      if (!trimmed) delete paygOverrides[fortnightId];
      else paygOverrides[fortnightId] = trimmed;
      await persist({ ...store, paygOverrides });
    },
    [persist, store]
  );

  const updateSettings = useCallback(
    async (patch) => {
      if (!store) return;
      await persist({
        ...store,
        settings: { ...store.settings, ...patch },
      });
    },
    [persist, store]
  );

  const replaceStore = useCallback(
    async (raw) => {
      await persist(normalizeStore(raw));
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      store,
      loadError,
      saveError,
      ready: Boolean(store),
      reload,
      clockIn,
      clockOut,
      upsertShift,
      deleteShift,
      markPaid,
      markUnpaid,
      setPaygOverride,
      updateSettings,
      replaceStore,
    }),
    [
      store,
      loadError,
      saveError,
      reload,
      clockIn,
      clockOut,
      upsertShift,
      deleteShift,
      markPaid,
      markUnpaid,
      setPaygOverride,
      updateSettings,
      replaceStore,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return value;
}
