import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

export function Rule({ style }) {
  return <View style={[styles.rule, style]} />;
}

const styles = StyleSheet.create({
  rule: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.85,
  },
});
