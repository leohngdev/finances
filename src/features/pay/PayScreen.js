import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { confirmAction } from "../../shared/confirm";
import { listFortnights, summarizeIncome, ytdFromPaid } from "../../services/domain";
import { useStore } from "../../services/StoreContext";
import { formatHours, formatMoney, formatRange } from "../../shared/format";
import { colors, fonts } from "../../shared/theme";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Field } from "../../shared/ui/Field";
import { PrizeSticker } from "../../shared/ui/PrizeSticker";
import { Rule } from "../../shared/ui/Rule";
import { Screen } from "../../shared/ui/Screen";

export function PayScreen() {
  const { store, markPaid, markUnpaid, setPaygOverride } = useStore();
  const fortnights = listFortnights(
    store.shifts,
    store.settings,
    store.payments,
    new Date(),
    store.paygOverrides || {}
  );
  const summary = summarizeIncome(fortnights);
  const ytd = ytdFromPaid(fortnights, new Date());
  const currency = store.settings.currency;
  const current = fortnights[0];

  function confirmPaid(fortnight) {
    const amount = fortnight.pay.net;
    confirmAction({
      title: "Mark as paid?",
      message: formatMoney(amount, currency),
      confirmLabel: "Mark as paid",
      onConfirm: () => markPaid(fortnight.id, amount),
    });
  }

  return (
    <Screen title="Pay">
      <PrizeSticker
        owed={formatMoney(summary.owed, currency)}
        paid={formatMoney(summary.paid, currency)}
        ytd={formatMoney(ytd.net, currency)}
      />

      {current ? (
        <FortnightBlock
          key={`current-${current.id}-${current.pay.payg}`}
          fortnight={current}
          title="These 2 weeks"
          currency={currency}
          onPaid={() => confirmPaid(current)}
          onUnpaid={() => markUnpaid(current.id)}
          onPayg={setPaygOverride}
        />
      ) : null}

      {fortnights.slice(1).map((fortnight) => (
        <FortnightBlock
          key={`${fortnight.id}-${fortnight.pay.payg}`}
          fortnight={fortnight}
          title={formatRange(fortnight.start, fortnight.end)}
          currency={currency}
          compact
          onPaid={() => confirmPaid(fortnight)}
          onUnpaid={() => markUnpaid(fortnight.id)}
          onPayg={setPaygOverride}
        />
      ))}
    </Screen>
  );
}

function StatusMark({ owed }) {
  return (
    <View style={[styles.stamp, owed ? styles.stampOwed : styles.stampPaid]}>
      <Text style={[styles.stampText, owed ? styles.stampTextOwed : styles.stampTextPaid]}>
        {owed ? "Owed" : "Paid"}
      </Text>
    </View>
  );
}

function FortnightBlock({ fortnight, title, currency, compact, onPaid, onUnpaid, onPayg }) {
  const [draftPayg, setDraftPayg] = useState(
    fortnight.pay.paygIsOverride ? String(fortnight.pay.payg) : ""
  );
  const owed = !fortnight.paid;

  return (
    <View style={styles.block}>
      <StatusMark owed={owed} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.muted}>{formatRange(fortnight.start, fortnight.end)}</Text>
      <Card ticket tilt={false} padded={false} style={styles.ticket}>
        <PayLines pay={fortnight.pay} currency={currency} hours={fortnight.hours} compact={compact} />
      </Card>
      {fortnight.paid ? (
        <Button label="Not paid" variant="ghost" onPress={onUnpaid} />
      ) : (
        <Button
          label={`Mark as paid ${formatMoney(fortnight.pay.net, currency)}`}
          variant="primary"
          icon="check"
          onPress={onPaid}
          disabled={fortnight.hours === 0}
        />
      )}
      <Field
        label="Tax on slip"
        prefix="$"
        value={draftPayg}
        onChangeText={setDraftPayg}
        placeholder={String(fortnight.pay.paygEstimated)}
      />
      <Button
        label="Save tax from slip"
        variant="secondary"
        onPress={() => onPayg(fortnight.id, draftPayg)}
      />
    </View>
  );
}

function PayLines({ pay, currency, hours, compact = false }) {
  return (
    <View style={styles.lines}>
      <Text style={styles.takeHome}>{formatMoney(pay.net, currency)}</Text>
      <Text style={styles.hours}>{formatHours(hours)}</Text>
      {!compact && (pay.saturdayHours || pay.sundayHours || pay.holidayHours || pay.nightHours || pay.weekdayHours) ? (
        <Text style={styles.split}>
          {[
            pay.weekdayHours ? `${formatHours(pay.weekdayHours)} weekday` : null,
            pay.nightHours ? `${formatHours(pay.nightHours)} after 10pm` : null,
            pay.saturdayHours ? `${formatHours(pay.saturdayHours)} Saturday` : null,
            pay.sundayHours ? `${formatHours(pay.sundayHours)} Sunday` : null,
            pay.holidayHours ? `${formatHours(pay.holidayHours)} public holiday` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      ) : null}
      <Rule style={styles.innerRule} />
      <View style={styles.details}>
        <Line label="Before tax" value={formatMoney(pay.gross, currency)} />
        <Line label="Tax" value={`− ${formatMoney(pay.payg, currency)}`} />
        <Line label="Super" value={formatMoney(pay.superAmount, currency)} />
      </View>
    </View>
  );
}

function Line({ label, value }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
    marginTop: 8,
  },
  stamp: {
    alignSelf: "flex-start",
    transform: [{ rotate: "-8deg" }],
    borderWidth: 2.5,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 2,
  },
  stampOwed: {
    borderColor: colors.primary,
  },
  stampPaid: {
    borderColor: colors.teal,
  },
  stampText: {
    fontFamily: fonts.display,
    fontSize: 14,
    letterSpacing: 1,
  },
  stampTextOwed: {
    color: colors.primary,
  },
  stampTextPaid: {
    color: colors.positive,
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
    marginBottom: 4,
  },
  ticket: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 22,
    marginVertical: 8,
  },
  takeHome: {
    fontFamily: fonts.money,
    fontSize: 40,
    color: colors.text,
    letterSpacing: -0.5,
  },
  hours: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    marginBottom: 4,
  },
  lines: {
    gap: 2,
  },
  innerRule: {
    marginVertical: 10,
    backgroundColor: colors.border,
  },
  details: {
    gap: 6,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  lineLabel: {
    fontFamily: fonts.body,
    color: colors.muted,
    flex: 1,
  },
  lineValue: {
    fontFamily: fonts.money,
    fontSize: 16,
    color: colors.text,
  },
  split: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
