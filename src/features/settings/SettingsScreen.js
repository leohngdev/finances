import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { addLocalDays, formatISODate, lineAmount, parseISODate, parseLoading, parseRate } from "../../services/domain";
import { useStore } from "../../services/StoreContext";
import { canUseFileBackup, downloadBackup, pickBackupFile } from "../../shared/backup";
import { confirmAction } from "../../shared/confirm";
import { formatDay, formatMoney } from "../../shared/format";
import { colors, fonts } from "../../shared/theme";
import { Button } from "../../shared/ui/Button";
import { Field } from "../../shared/ui/Field";
import { Rule } from "../../shared/ui/Rule";
import { Screen } from "../../shared/ui/Screen";
import { BoltMark, NutButton, Truck } from "../../shared/ui/Truck";

function DateStepper({ valueISO, onChangeISO }) {
  const date = parseISODate(valueISO || "2026-06-29");
  return (
    <View style={styles.anchorRow}>
      <NutButton
        direction="prev"
        accessibilityLabel="Previous day"
        onPress={() => onChangeISO(formatISODate(addLocalDays(date, -1)))}
      />
      <View style={styles.anchorCenter}>
        <Text style={styles.anchorDate}>{formatDay(date, { weekday: "long", year: true })}</Text>
      </View>
      <NutButton
        direction="next"
        accessibilityLabel="Next day"
        onPress={() => onChangeISO(formatISODate(addLocalDays(date, 1)))}
      />
    </View>
  );
}

export function SettingsScreen() {
  const { store, updateSettings, replaceStore } = useStore();
  const [draft, setDraft] = useState(store.settings);
  const [saved, setSaved] = useState(false);
  const [backupNote, setBackupNote] = useState("");

  useEffect(() => {
    setDraft(store.settings);
  }, [store.settings]);

  function setField(key, value) {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    await updateSettings({
      headerRate: String(draft.headerRate || "").trim(),
      headerRateFrom: draft.headerRateFrom,
      previousHeaderRate: String(draft.previousHeaderRate || "").trim(),
      saturdayLoading: String(draft.saturdayLoading || "").trim(),
      sundayLoading: String(draft.sundayLoading || "").trim(),
      publicHolidayLoading: String(draft.publicHolidayLoading || "").trim(),
      nightLoading: String(draft.nightLoading || "").trim(),
      superPercent: String(draft.superPercent || "").trim(),
      fortnightAnchor: draft.fortnightAnchor,
      currency: draft.currency || "AUD",
    });
    setSaved(true);
  }

  const header = parseRate(draft.headerRate);
  const previous = parseRate(draft.previousHeaderRate);
  const sat = parseLoading(draft.saturdayLoading, 125);
  const sun = parseLoading(draft.sundayLoading, 150);
  const holiday = parseLoading(draft.publicHolidayLoading, 250);
  const night = parseLoading(draft.nightLoading, 110);

  return (
    <Screen
      title="Settings"
      subtitle="Your hourly pay. Saturday and Sunday are extra % of this number. After 10pm on weekdays is a bit extra."
    >
      <Truck />
      <View style={styles.sectionRow}>
        <BoltMark />
        <Text style={styles.section}>Your hourly pay</Text>
      </View>
      <Text style={styles.note}>
        Weekday pay before 10:00 PM. Older shifts use the earlier number until the date below.
      </Text>
      <Field
        label="Hourly pay now"
        prefix="$"
        value={draft.headerRate}
        onChangeText={(value) => setField("headerRate", value)}
        placeholder="34.00"
        hint="Latest slip: $34.00."
      />
      <Text style={styles.dateLabel}>This pay started on</Text>
      <DateStepper
        valueISO={draft.headerRateFrom}
        onChangeISO={(value) => setField("headerRateFrom", value)}
      />
      <Field
        label="Pay before that date"
        prefix="$"
        value={draft.previousHeaderRate}
        onChangeText={(value) => setField("previousHeaderRate", value)}
        placeholder="31.18"
        hint="Used on shifts before the date above. Older slips: $31.18."
      />

      <Rule />

      <View style={styles.sectionRow}>
        <BoltMark />
        <Text style={styles.section}>Extra pay</Text>
      </View>
      <Text style={styles.note}>
        Saturday and Sunday stay extra all evening. After 10pm only applies Monday to Friday. A public holiday replaces those on a shift you mark.
      </Text>
      <Field
        label="Saturday"
        value={draft.saturdayLoading}
        onChangeText={(value) => setField("saturdayLoading", value)}
        placeholder="125"
        hint={
          header
            ? `125% of hourly pay → ${formatMoney(lineAmount(1, header, sat), draft.currency)} an hour`
            : "Extra % of your hourly pay"
        }
      />
      <Field
        label="Sunday"
        value={draft.sundayLoading}
        onChangeText={(value) => setField("sundayLoading", value)}
        placeholder="150"
        hint={
          header
            ? `150% of hourly pay → ${formatMoney(lineAmount(1, header, sun), draft.currency)} an hour`
            : "Extra % of your hourly pay"
        }
      />
      <Field
        label="Public holiday"
        value={draft.publicHolidayLoading}
        onChangeText={(value) => setField("publicHolidayLoading", value)}
        placeholder="250"
        hint={
          header
            ? `250% of hourly pay → ${formatMoney(lineAmount(1, header, holiday), draft.currency)} an hour`
            : "Replaces the usual rate on a shift you mark"
        }
      />
      <Field
        label="Weekday after 10:00 PM"
        value={draft.nightLoading}
        onChangeText={(value) => setField("nightLoading", value)}
        placeholder="110"
        hint={
          header
            ? `110% of hourly pay → ${formatMoney(lineAmount(1, header, night), draft.currency)} an hour · weekdays only`
            : "Weekdays only"
        }
      />
      {previous && draft.headerRateFrom ? (
        <Text style={styles.note}>
          Before {formatDay(parseISODate(draft.headerRateFrom), { weekday: "short" })} those extras use $
          {Number(previous).toFixed(2)} instead.
        </Text>
      ) : null}

      <Rule />

      <View style={styles.sectionRow}>
        <BoltMark />
        <Text style={styles.section}>Super your boss pays (not taken from you)</Text>
      </View>
      <Text style={styles.note}>
        This is extra money your boss pays into super. It is not taken from what you take home. What you take home
        is before-tax pay minus tax.
      </Text>
      <Field
        label="Percent your boss pays"
        value={draft.superPercent}
        onChangeText={(value) => setField("superPercent", value)}
        placeholder="12"
        hint="12% of the 2-week total before tax"
      />

      <Rule />

      <View style={styles.sectionRow}>
        <BoltMark />
        <Text style={styles.section}>These 2 weeks</Text>
      </View>
      <Text style={styles.note}>
        Pay is counted in 14-day blocks from this start. Money often arrives weeks later. Mark it paid when it
        actually hits your account.
      </Text>
      <DateStepper
        valueISO={draft.fortnightAnchor}
        onChangeISO={(value) => setField("fortnightAnchor", value)}
      />

      <Button label={saved ? "Saved" : "Save"} onPress={save} />

      {canUseFileBackup() ? (
        <>
          <Rule />
          <View style={styles.sectionRow}>
            <BoltMark />
            <Text style={styles.section}>Backup</Text>
          </View>
          <Text style={styles.note}>
            Hours live in this browser. If Safari clears them, they’re gone. Save a copy now and then.
          </Text>
          <Button
            label="Save a backup"
            variant="secondary"
            onPress={() => {
              downloadBackup(store);
              setBackupNote("Saved to your Downloads folder.");
            }}
          />
          <Button
            label="Load a backup"
            variant="ghost"
            onPress={() => {
              confirmAction({
                title: "Replace what’s on this phone?",
                message: "This overwrites hours and pay on this device.",
                confirmLabel: "Load",
                destructive: true,
                onConfirm: async () => {
                  try {
                    const raw = await pickBackupFile();
                    await replaceStore(raw);
                    setBackupNote("Backup loaded.");
                  } catch (err) {
                    if (err.message !== "No file picked.") setBackupNote(err.message);
                  }
                },
              });
            }}
          />
          {backupNote ? <Text style={styles.local}>{backupNote}</Text> : null}
        </>
      ) : null}

      <Text style={styles.local}>Everything stays on this phone. Nothing is uploaded.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  section: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
    letterSpacing: 0.8,
    flex: 1,
  },
  note: {
    fontFamily: fonts.body,
    color: colors.muted,
    lineHeight: 20,
    marginTop: -8,
  },
  dateLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  anchorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  anchorCenter: {
    flex: 1,
    alignItems: "center",
  },
  anchorDate: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
  local: {
    fontFamily: fonts.body,
    textAlign: "center",
    color: colors.muted,
    fontSize: 13,
    marginBottom: 12,
  },
});
