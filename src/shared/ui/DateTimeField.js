import { createElement } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { addLocalDays, formatISODate } from "../../services/domain";
import { formatDay } from "../format";
import { colors, fonts } from "../theme";

function pad(value) {
  return String(value).padStart(2, "0");
}

function Stepper({ value, onStep, onSet, label, compact }) {
  return (
    <View style={[styles.stepper, compact && styles.stepperCompact]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        onPress={() => onStep(-1)}
        style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
      >
        <Text style={styles.stepLabel}>−</Text>
      </Pressable>
      <TextInput
        accessibilityLabel={label}
        value={pad(value)}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, "").slice(-2);
          if (!digits) return;
          onSet(Number(digits));
        }}
        keyboardType="number-pad"
        maxLength={2}
        style={styles.stepValue}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        onPress={() => onStep(1)}
        style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
      >
        <Text style={styles.stepLabel}>+</Text>
      </Pressable>
    </View>
  );
}

function webInput(props, style) {
  return createElement("input", {
    ...props,
    style: {
      fontSize: 16,
      color: colors.text,
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      minHeight: 44,
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      textAlign: "center",
      ...style,
    },
  });
}

export function DateTimeField({ label, value, onChange }) {
  const date = new Date(value);
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const isPm = hours24 >= 12;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  function withParts(nextHours, nextMinutes, nextSeconds) {
    const next = new Date(date);
    next.setHours(nextHours, nextMinutes, nextSeconds, 0);
    return next;
  }

  function changeDate(delta) {
    const next = addLocalDays(date, delta);
    next.setHours(hours24, minutes, seconds, 0);
    onChange(next);
  }

  function setDateFromInput(iso) {
    if (!iso) return;
    const [year, month, day] = iso.split("-").map(Number);
    if (!year || !month || !day) return;
    const next = new Date(date);
    next.setFullYear(year, month - 1, day);
    next.setHours(hours24, minutes, seconds, 0);
    onChange(next);
  }

  function setHour12(nextHour12) {
    const hour12 = Math.min(12, Math.max(1, nextHour12));
    const hour24 = hour12 === 12 ? (isPm ? 12 : 0) : hour12 + (isPm ? 12 : 0);
    onChange(withParts(hour24, minutes, seconds));
  }

  function setMinute(nextMinutes) {
    onChange(withParts(hours24, Math.min(59, Math.max(0, nextMinutes)), seconds));
  }

  function setSecond(nextSeconds) {
    onChange(withParts(hours24, minutes, Math.min(59, Math.max(0, nextSeconds))));
  }

  function bump(unit, delta) {
    const next = new Date(date);
    if (unit === "hour") next.setHours(hours24 + delta);
    if (unit === "minute") next.setMinutes(minutes + delta);
    if (unit === "second") next.setSeconds(seconds + delta);
    onChange(next);
  }

  function setMeridiem(nextPm) {
    if (nextPm === isPm) return;
    onChange(withParts(hours24 + (nextPm ? 12 : -12), minutes, seconds));
  }

  function setTimeFromInput(raw) {
    const parts = String(raw || "").split(":").map(Number);
    if (!Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return;
    const nextSeconds = Number.isFinite(parts[2]) ? parts[2] : seconds;
    onChange(withParts(parts[0], parts[1], nextSeconds));
  }

  const timeValue = `${pad(hours24)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dateRow}>
        <Pressable
          onPress={() => changeDate(-1)}
          accessibilityRole="button"
          accessibilityLabel="Previous day"
          style={({ pressed }) => [styles.dateBtn, pressed && styles.pressed]}
        >
          <Text style={styles.dateBtnText}>‹</Text>
        </Pressable>
        <View style={styles.dateCenter}>
          {Platform.OS === "web" ? (
            webInput(
              {
                type: "date",
                value: formatISODate(date),
                "aria-label": `${label} date`,
                onChange: (event) => setDateFromInput(event.target.value),
              },
              { fontFamily: fonts.bodyBold }
            )
          ) : (
            <Text style={styles.dateText}>{formatDay(date, { weekday: "long" })}</Text>
          )}
        </View>
        <Pressable
          onPress={() => changeDate(1)}
          accessibilityRole="button"
          accessibilityLabel="Next day"
          style={({ pressed }) => [styles.dateBtn, pressed && styles.pressed]}
        >
          <Text style={styles.dateBtnText}>›</Text>
        </Pressable>
      </View>
      {Platform.OS === "web" ? (
        <View style={styles.timePick}>
          {webInput(
            {
              type: "time",
              step: "1",
              value: timeValue,
              "aria-label": `${label} time`,
              onChange: (event) => setTimeFromInput(event.target.value),
            },
            { fontFamily: fonts.digits, fontSize: 22 }
          )}
        </View>
      ) : (
        <View style={styles.timeRow}>
          <Stepper
            label="Hour"
            value={hours12}
            onStep={(delta) => bump("hour", delta)}
            onSet={setHour12}
          />
          <Text style={styles.colon}>:</Text>
          <Stepper
            label="Minute"
            value={minutes}
            onStep={(delta) => bump("minute", delta)}
            onSet={setMinute}
          />
          <Text style={styles.colon}>:</Text>
          <Stepper
            label="Second"
            value={seconds}
            onStep={(delta) => bump("second", delta)}
            onSet={setSecond}
          />
        </View>
      )}
      {Platform.OS === "web" ? (
        <View style={styles.secondsRow}>
          <Text style={styles.secondsLabel}>Seconds</Text>
          <Stepper
            compact
            label="Second"
            value={seconds}
            onStep={(delta) => bump("second", delta)}
            onSet={setSecond}
          />
        </View>
      ) : null}
      {Platform.OS === "web" ? null : (
        <View style={styles.meridiem}>
          <Pressable
            onPress={() => setMeridiem(false)}
            accessibilityRole="button"
            accessibilityLabel="AM"
            style={[styles.meridiemBtn, !isPm && styles.meridiemOn]}
          >
            <Text style={[styles.meridiemText, !isPm && styles.meridiemTextOn]}>AM</Text>
          </Pressable>
          <Pressable
            onPress={() => setMeridiem(true)}
            accessibilityRole="button"
            accessibilityLabel="PM"
            style={[styles.meridiemBtn, isPm && styles.meridiemOn]}
          >
            <Text style={[styles.meridiemText, isPm && styles.meridiemTextOn]}>PM</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    width: "100%",
    minWidth: 0,
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
    fontSize: 20,
    color: colors.primary,
    marginTop: -2,
  },
  dateCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 2,
  },
  dateText: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
  },
  timePick: {
    minHeight: 44,
    minWidth: 0,
    width: "100%",
    justifyContent: "center",
  },
  secondsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  secondsLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.muted,
    width: 72,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  stepper: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepperCompact: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    justifyContent: "flex-start",
  },
  stepBtn: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.primary,
  },
  stepValue: {
    fontFamily: fonts.digits,
    fontSize: 20,
    color: colors.text,
    width: 36,
    minWidth: 36,
    maxWidth: 36,
    textAlign: "center",
    padding: 0,
  },
  colon: {
    fontFamily: fonts.digits,
    fontSize: 20,
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
