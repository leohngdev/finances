import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { Icon } from "./Icon";

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  style,
}) {
  const palette = variants[variant] || variants.primary;
  const display = variant === "primary" || variant === "accent";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg },
        display && styles.hero,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} color={palette.text} size={display ? 22 : 18} /> : null}
          <Text
            style={[
              styles.label,
              display && styles.heroLabel,
              { color: palette.text, fontFamily: display ? fonts.display : fonts.bodyBold },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const variants = {
  primary: { bg: colors.primary, text: colors.primaryText },
  secondary: { bg: "transparent", text: colors.primary },
  ghost: { bg: "transparent", text: colors.muted },
  danger: { bg: "transparent", text: colors.danger },
  positive: { bg: colors.teal, text: colors.bone },
  accent: { bg: colors.griptape, text: colors.bone },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  hero: {
    minHeight: 58,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 16,
  },
  heroLabel: {
    fontSize: 18,
    letterSpacing: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
