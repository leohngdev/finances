import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { Sticker } from "./Sticker";

export function PrizeSticker({ owed, paid, ytd }) {
  return (
    <Sticker>
      <Text style={styles.eyebrow}>Owed</Text>
      <Text style={styles.owed}>{owed}</Text>
      <Text style={styles.paid}>Paid {paid}</Text>
      <View style={styles.perf} />
      <Text style={styles.year}>Since 1 July · {ytd}</Text>
    </Sticker>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.primary,
    letterSpacing: 1,
  },
  owed: {
    fontFamily: fonts.money,
    fontSize: 40,
    color: colors.primary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  paid: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.positive,
    marginTop: 2,
  },
  perf: {
    height: 1,
    marginVertical: 12,
    borderStyle: "dashed",
    borderBottomWidth: 1.5,
    borderColor: colors.border,
  },
  year: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
  },
});
