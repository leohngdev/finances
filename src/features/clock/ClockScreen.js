import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import {
  calculateShiftPay,
  calculateShiftsPay,
  defaultShiftTimes,
  findOpenShift,
  getFortnightRange,
  hasPayRates,
  liveHours,
  shiftHours,
  shiftsInRange,
} from "../../services/domain";
import { useStore } from "../../services/StoreContext";
import {
  formatClockRange,
  formatDurationMs,
  formatHours,
  formatMoney,
  formatRange,
  formatTime,
} from "../../shared/format";
import { colors, fonts } from "../../shared/theme";
import { Button } from "../../shared/ui/Button";
import { Sticker } from "../../shared/ui/Sticker";
import { PunchClock } from "../../shared/ui/PunchClock";
import { Rule } from "../../shared/ui/Rule";
import { Screen } from "../../shared/ui/Screen";
import { ShiftEditor } from "../history/ShiftEditor";

function LiveDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);
  return <Animated.View accessibilityLabel="On" style={[styles.dot, { opacity: pulse }]} />;
}

export function ClockScreen({ onOpenSettings, onOpenHistory, onOpenPay }) {
  const { store, clockIn, clockOut, upsertShift } = useStore();
  const [now, setNow] = useState(() => new Date());
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const settings = store.settings;
  const open = findOpenShift(store.shifts);
  const range = getFortnightRange(now, settings.fortnightAnchor);
  const completed = shiftsInRange(store.shifts, range);
  const live = open ? liveHours(open, now) : 0;
  const livePay = open
    ? calculateShiftPay(open.clockIn, now.toISOString(), settings)
    : null;
  const fortnightPay = calculateShiftsPay(
    open ? [...completed, { clockIn: open.clockIn, clockOut: now.toISOString() }] : completed,
    settings,
    store.paygOverrides && store.paygOverrides[range.id],
    (store.payments.find((payment) => payment.fortnightId === range.id) || {}).paidAt || now
  );
  const recent = useMemo(
    () =>
      [...store.shifts]
        .sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn))
        .slice(0, 3),
    [store.shifts]
  );

  function openLogPast() {
    const times = defaultShiftTimes(store.shifts, now);
    setDraft({ clockIn: times.clockIn, clockOut: times.clockOut });
    setEditorOpen(true);
  }

  return (
    <Screen title="Clock">
      {!hasPayRates(settings) ? (
        <Button label="Add hourly pay" variant="secondary" onPress={onOpenSettings} />
      ) : null}

      <View style={styles.hero}>
        <PunchClock
          date={now}
          live={Boolean(open)}
          label={open ? "Clock out" : "Clock in"}
          onPress={() => (open ? clockOut(new Date()) : clockIn(new Date()))}
        />
        {open ? (
          <View style={styles.liveMeta}>
            <Text style={styles.timer}>{formatDurationMs(now - new Date(open.clockIn))}</Text>
            <Text style={styles.heroMeta}>
              {formatTime(open.clockIn)}
              {livePay && hasPayRates(settings)
                ? ` · ${formatHours(live)} · ${formatMoney(livePay.gross, settings.currency)}`
                : ` · ${formatHours(live)}`}
            </Text>
          </View>
        ) : null}
        <Button label="Add a past shift" variant="secondary" icon="plus" onPress={openLogPast} />
      </View>

      <Rule />

      <Pressable onPress={onOpenPay} style={styles.payTap} accessibilityRole="button" accessibilityLabel="Pay">
        <Sticker>
          <Text style={styles.cardTitle}>These 2 weeks</Text>
          <Text style={styles.muted}>{formatRange(range.start, range.end)}</Text>
          {hasPayRates(settings) ? (
            <>
              <Text style={styles.big}>{formatMoney(fortnightPay.net, settings.currency)}</Text>
              <Text style={styles.muted}>{formatHours(fortnightPay.hours)}</Text>
            </>
          ) : (
            <Text style={styles.big}>{formatHours(fortnightPay.hours)}</Text>
          )}
        </Sticker>
      </Pressable>

      {recent.length > 0 ? (
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <Pressable onPress={onOpenHistory} hitSlop={8}>
            <Text style={styles.link}>All</Text>
          </Pressable>
        </View>
      ) : null}
      {recent.map((shift, index) => (
        <View key={shift.id}>
          {index > 0 ? <Rule /> : null}
          <View style={styles.shiftRow}>
            <View style={styles.shiftCopy}>
              <Text style={styles.shiftWhen}>{formatClockRange(shift.clockIn, shift.clockOut)}</Text>
              <Text style={styles.muted}>
                {new Date(shift.clockIn).toLocaleDateString("en-AU", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {shift.clockOut ? ` · ${formatHours(shiftHours(shift.clockIn, shift.clockOut))}` : ""}
              </Text>
            </View>
            {shift.clockOut && hasPayRates(settings) ? (
              <Text style={styles.shiftPay}>
                {formatMoney(
                  calculateShiftPay(shift.clockIn, shift.clockOut, settings).net,
                  settings.currency
                )}
              </Text>
            ) : !shift.clockOut ? (
              <LiveDot />
            ) : null}
          </View>
        </View>
      ))}

      <ShiftEditor
        visible={editorOpen}
        title="Add a past shift"
        initial={draft}
        settings={settings}
        onClose={() => setEditorOpen(false)}
        onSave={upsertShift}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: 12,
  },
  liveMeta: {
    alignItems: "center",
    gap: 2,
  },
  timer: {
    fontFamily: fonts.digits,
    fontSize: 36,
    color: colors.ink,
    letterSpacing: -1,
  },
  heroMeta: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 15,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    letterSpacing: 0.6,
  },
  muted: {
    fontFamily: fonts.body,
    color: colors.muted,
    lineHeight: 20,
  },
  payTap: {
    gap: 4,
  },
  big: {
    fontFamily: fonts.money,
    fontSize: 36,
    color: colors.text,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    letterSpacing: 0.6,
  },
  link: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
  shiftRow: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 52,
  },
  shiftCopy: {
    flex: 1,
    gap: 2,
  },
  shiftWhen: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  shiftPay: {
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
