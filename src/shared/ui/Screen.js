import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, space } from "../theme";

export function Screen({ title, subtitle, children, scroll = true }) {
  const body = (
    <View style={styles.inner}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );

  if (!scroll) {
    return <View style={styles.fill}>{body}</View>;
  }

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {body}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  inner: {
    paddingHorizontal: space[5],
    paddingTop: space[3],
    gap: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.ink,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.muted,
    marginTop: -8,
  },
});
