import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

export function Sticker({ children, style }) {
  return (
    <View style={[styles.sticker, style]}>
      <View style={[styles.bolt, styles.tl]} />
      <View style={[styles.bolt, styles.tr]} />
      <View style={[styles.bolt, styles.bl]} />
      <View style={[styles.bolt, styles.br]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    borderBottomRightRadius: 5,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    transform: [{ rotate: "-1.2deg" }],
  },
  bolt: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.maple,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  tl: { top: 12, left: 12 },
  tr: { top: 12, right: 12 },
  bl: { bottom: 8, left: 8 },
  br: { bottom: 8, right: 8 },
});
