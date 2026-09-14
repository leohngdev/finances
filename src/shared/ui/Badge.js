import { StyleSheet, Text } from "react-native";
import { colors, fonts } from "../theme";

export function Badge({ label, tone = "muted" }) {
  const color = tones[tone] || tones.muted;
  return <Text style={[styles.label, { color }]}>{label}</Text>;
}

const tones = {
  muted: colors.muted,
  owed: colors.primary,
  paid: colors.positive,
  live: colors.primary,
};

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
});
