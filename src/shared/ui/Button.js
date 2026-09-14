import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts } from "../theme";

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
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
        <Text
          style={[
            styles.label,
            display && styles.heroLabel,
            { color: palette.text, fontFamily: display ? fonts.display : fonts.bodyBold },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const variants = {
  primary: { bg: colors.primary, text: colors.primaryText },
  secondary: { bg: "transparent", text: colors.primary },
  ghost: { bg: "transparent", text: colors.muted },
  danger: { bg: "transparent", text: colors.danger },
  positive: { bg: colors.positive, text: colors.primaryText },
  accent: { bg: colors.text, text: colors.paper },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  hero: {
    minHeight: 64,
  },
  label: {
    fontSize: 16,
  },
  heroLabel: {
    fontSize: 24,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});
