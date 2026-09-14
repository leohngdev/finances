import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  calculateShiftPay,
  defaultShiftTimes,
  groupShiftsByDay,
  hasPayRates,
  shiftHours,
} from "../../services/domain";
import { useStore } from "../../services/StoreContext";
import { formatClockRange, formatDay, formatHours, formatMoney } from "../../shared/format";
import { colors, fonts } from "../../shared/theme";
import { Button } from "../../shared/ui/Button";
import { Rule } from "../../shared/ui/Rule";
import { Screen } from "../../shared/ui/Screen";
import { ShiftEditor } from "./ShiftEditor";

function LiveDot() {
  return <View accessibilityLabel="On" style={styles.dot} />;
}

export function HistoryScreen() {
  const { store, upsertShift, deleteShift } = useStore();
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const groups = groupShiftsByDay(store.shifts);
  const settings = store.settings;

  function addShift() {
    const times = defaultShiftTimes(store.shifts);
    setDraft({ clockIn: times.clockIn, clockOut: times.clockOut });
    setEditorOpen(true);
  }

  function editShift(shift) {
    setDraft(shift);
    setEditorOpen(true);
  }

  return (
    <Screen title="Hours">
      <Button label="Add a past shift" variant="secondary" onPress={addShift} />
      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.day}>{formatDay(group.date, { weekday: "long" })}</Text>
          {group.shifts.map((shift, index) => {
            const hours = shift.clockOut ? shiftHours(shift.clockIn, shift.clockOut) : 0;
            const pay = shift.clockOut
              ? calculateShiftPay(shift.clockIn, shift.clockOut, settings)
              : null;
            return (
              <View key={shift.id}>
                {index > 0 ? <Rule /> : null}
                <Pressable onPress={() => editShift(shift)} style={styles.row}>
                  <View style={styles.copy}>
                    <Text style={styles.when}>{formatClockRange(shift.clockIn, shift.clockOut)}</Text>
                    {shift.clockOut ? (
                      <Text style={styles.muted}>{formatHours(hours)}</Text>
                    ) : null}
                  </View>
                  {shift.clockOut && hasPayRates(settings) ? (
                    <Text style={styles.takeHome}>{formatMoney(pay.net, settings.currency)}</Text>
                  ) : !shift.clockOut ? (
                    <LiveDot />
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
      <ShiftEditor
        visible={editorOpen}
        title={draft && draft.id ? "Edit shift" : "Add a past shift"}
        initial={draft}
        settings={settings}
        onClose={() => setEditorOpen(false)}
        onSave={upsertShift}
        onDelete={draft && draft.id ? deleteShift : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 2,
  },
  day: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.primary,
    marginTop: 8,
  },
  row: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 56,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  when: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  muted: {
    fontFamily: fonts.body,
    color: colors.muted,
    lineHeight: 20,
  },
  takeHome: {
    fontFamily: fonts.money,
    fontSize: 18,
    color: colors.text,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: colors.primary,
  },
});
