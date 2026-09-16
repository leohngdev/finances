import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

export function Card({ children, style, padded = true, ticket = false, tilt = true }) {
  return (
    <View style={[ticket && styles.sticker, ticket && tilt && styles.tilt, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    overflow: "hidden",
  },
  tilt: {
    transform: [{ rotate: "-0.6deg" }],
  },
  padded: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
});
