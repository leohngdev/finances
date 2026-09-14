import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

function Perforation() {
  return (
    <View style={styles.dots} pointerEvents="none">
      {Array.from({ length: 18 }, (_, i) => (
        <View key={i} style={styles.dot} />
      ))}
    </View>
  );
}

/** Quiet wrapper by default. `ticket` is the one earned container — a receipt stub. */
export function Card({ children, style, padded = true, ticket = false }) {
  return (
    <View style={[ticket && styles.ticket, padded && styles.padded, style]}>
      {ticket ? <Perforation /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.paper,
    paddingTop: 14,
    overflow: "hidden",
    position: "relative",
  },
  padded: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  dots: {
    position: "absolute",
    top: 6,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.bg,
  },
});
