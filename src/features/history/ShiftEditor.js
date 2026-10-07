import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { confirmAction } from "../../shared/confirm";
import {
  calculateShiftPay,
  hasPayRates,
  shiftHours,
} from "../../services/domain";
import { formatHours, formatMoney } from "../../shared/format";
import { colors, fonts } from "../../shared/theme";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { DateTimeField } from "../../shared/ui/DateTimeField";

export function ShiftEditor({ visible, title, initial, settings, onClose, onSave, onDelete }) {
  const [clockIn, setClockIn] = useState(new Date());
  const [clockOut, setClockOut] = useState(new Date());
  const [openEnded, setOpenEnded] = useState(false);
  const [publicHoliday, setPublicHoliday] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible || !initial) return;
    setClockIn(new Date(initial.clockIn));
    setClockOut(initial.clockOut ? new Date(initial.clockOut) : new Date(initial.clockIn));
    setOpenEnded(!initial.clockOut);
    setPublicHoliday(Boolean(initial.publicHoliday));
    setError("");
  }, [visible, initial]);

  const preview = useMemo(() => {
    if (openEnded) {
      return { hours: 0, pay: null };
    }
    const hours = shiftHours(clockIn.toISOString(), clockOut.toISOString());
    const pay = calculateShiftPay(
      clockIn.toISOString(),
      clockOut.toISOString(),
      settings,
      null,
      null,
      publicHoliday
    );
    return { hours, pay };
  }, [clockIn, clockOut, openEnded, publicHoliday, settings]);

  async function handleSave() {
    try {
      setError("");
      await onSave({
        id: initial && initial.id,
        clockIn,
        clockOut: openEnded ? null : clockOut,
        publicHoliday,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Couldn’t save this shift.");
    }
  }

  function handleDelete() {
    if (!onDelete || !initial || !initial.id) return;
    confirmAction({
      title: "Delete this shift?",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: async () => {
        await onDelete(initial.id);
        onClose();
      },
    });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.grab} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Done</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <DateTimeField label="Clock in" value={clockIn} onChange={setClockIn} />
          <Pressable
            onPress={() => setOpenEnded((value) => !value)}
            style={styles.toggle}
            accessibilityRole="button"
          >
            <Text style={styles.toggleText}>{openEnded ? "No clock-out" : "Clock out"}</Text>
            <Text style={styles.toggleAction}>{openEnded ? "Add finish" : "Leave open"}</Text>
          </Pressable>
          {openEnded ? null : <DateTimeField label="Clock out" value={clockOut} onChange={setClockOut} />}
          <Pressable
            onPress={() => setPublicHoliday((value) => !value)}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityState={{ selected: publicHoliday }}
          >
            <Text style={styles.toggleText}>Public holiday</Text>
            <Text style={styles.toggleAction}>{publicHoliday ? "On" : "Off"}</Text>
          </Pressable>
          {openEnded ? null : (
            <Card ticket tilt={false} padded={false} style={styles.ticket}>
              <Text style={styles.previewValue}>
                {preview.pay && hasPayRates(settings)
                  ? formatMoney(preview.pay.net, settings.currency)
                  : formatHours(preview.hours)}
              </Text>
              {preview.pay && hasPayRates(settings) ? (
                <Text style={styles.previewSplit}>{formatHours(preview.hours)}</Text>
              ) : null}
              {preview.pay && hasPayRates(settings) ? (
                <Text style={styles.previewSplit}>
                  Before tax {formatMoney(preview.pay.gross, settings.currency)} · tax{" "}
                  {formatMoney(preview.pay.payg, settings.currency)} · super{" "}
                  {formatMoney(preview.pay.superAmount, settings.currency)}
                </Text>
              ) : null}
            </Card>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Save shift" onPress={handleSave} />
          {onDelete && initial && initial.id ? (
            <Button label="Delete this shift" variant="danger" onPress={handleDelete} />
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 10,
  },
  grab: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    flex: 1,
  },
  close: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
    fontSize: 16,
  },
  body: {
    padding: 20,
    gap: 18,
    paddingBottom: 40,
  },
  toggle: {
    minHeight: 48,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleText: {
    fontFamily: fonts.body,
    color: colors.text,
    flex: 1,
  },
  toggleAction: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
  ticket: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 22,
  },
  previewValue: {
    fontFamily: fonts.money,
    color: colors.text,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  previewSplit: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 20,
  },
  error: {
    fontFamily: fonts.bodySemi,
    color: colors.danger,
  },
});
