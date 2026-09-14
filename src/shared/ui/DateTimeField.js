import { Pressable, StyleSheet, Text, View } from "react-native";
import { addLocalDays, formatISODate, startOfLocalDay } from "../../services/domain";
import { formatDay } from "../format";
import { colors, fonts } from "../theme";

function Stepper({ value, onChange, min, max, step = 1, wide }) {
  return (
    <View style={[styles.stepper, wide && styles.stepperWide]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        onPress={() => onChange(wrap(value - step, min, max))}
        style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
      >
        <Text style={styles.stepLabel}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{String(value).padStart(2, "0")}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase"
        onPress={() => onChange(wrap(value + step, min, max))}
        style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
      >
        <Text style={styles.stepLabel}>+</Text>
      </Pressable>
    </View>
  );
}

function wrap(value, min, max) {
  const span = max - min + 1;
  return ((((value - min) % span) + span) % span) + min;
}

function setTime(date, hours, minutes) {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function DateTimeField({ label, value, onChange }) {
  const date = new Date(value);
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const isPm = hours24 >= 12;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  function changeDate(delta) {
    const next = addLocalDays(date, delta);
    next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(next);
  }

  function changeHour12(nextHour12) {
    const hour24 = (nextHour12 % 12) + (isPm ? 12 : 0);
    onChange(setTime(date, hour24, minutes));
  }

  function changeMinutes(nextMinutes) {
    onChange(setTime(date, hours24, nextMinutes));
  }

  function setMeridiem(nextPm) {
    const base = hours24 % 12;
    onChange(setTime(date, base + (nextPm ? 12 : 0), minutes));
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dateRow}>
        <Pressable onPress={() => changeDate(-1)} style={({ pressed }) => [styles.dateBtn, pressed && styles.pressed]}>
          <Text style={styles.dateBtnText}>‹</Text>
        </Pressable>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{formatDay(date, { weekday: "long" })}</Text>
          {formatISODate(date) !== formatISODate(new Date()) ? (
            <Pressable onPress={() => onChange(setTime(startOfLocalDay(new Date()), hours24, minutes))}>
              <Text style={styles.today}>Jump to today</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => changeDate(1)} style={({ pressed }) => [styles.dateBtn, pressed && styles.pressed]}>
          <Text style={styles.dateBtnText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.timeRow}>
        <Stepper value={hours12} min={1} max={12} onChange={changeHour12} />
        <Text style={styles.colon}>:</Text>
        <Stepper value={minutes} min={0} max={59} step={5} onChange={changeMinutes} wide />
      </View>
      <View style={styles.meridiem}>
        <Pressable
          onPress={() => setMeridiem(false)}
          style={[styles.meridiemBtn, !isPm && styles.meridiemOn]}
        >
          <Text style={[styles.meridiemText, !isPm && styles.meridiemTextOn]}>AM</Text>
        </Pressable>
        <Pressable
          onPress={() => setMeridiem(true)}
          style={[styles.meridiemBtn, isPm && styles.meridiemOn]}
        >
          <Text style={[styles.meridiemText, isPm && styles.meridiemTextOn]}>PM</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.muted,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBtnText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.primary,
    marginTop: -2,
  },
  dateCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  dateText: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
  },
  today: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
    fontSize: 13,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepperWide: {
    flex: 1.1,
  },
  stepBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.primary,
  },
  stepValue: {
    fontFamily: fonts.digits,
    fontSize: 24,
    color: colors.text,
    minWidth: 36,
    textAlign: "center",
  },
  colon: {
    fontFamily: fonts.digits,
    fontSize: 24,
    color: colors.muted,
  },
  meridiem: {
    flexDirection: "row",
    gap: 8,
  },
  meridiemBtn: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  meridiemOn: {
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  meridiemText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.muted,
  },
  meridiemTextOn: {
    color: colors.primaryText,
  },
  pressed: {
    opacity: 0.7,
  },
});
