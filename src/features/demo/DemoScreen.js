import { StyleSheet, Text, View, ScrollView } from "react-native";

/** Disposable portfolio canvas for Expo */
export function DemoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.eyebrow}>ARCHETYPE · PORTFOLIO</Text>
      <Text style={styles.title}>Portfolio</Text>
      <Text style={styles.line}>Hero identity</Text>
      <Text style={styles.line}>Work grid</Text>
      <Text style={styles.muted}>Replace this screen as your product direction becomes clear.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24, gap: 10 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, color: "#666" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  line: { fontSize: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  muted: { color: "#666", marginTop: 16, lineHeight: 22 },
});
