import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts } from "../theme";

export function Field({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  keyboardType = "decimal-pad",
  prefix,
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          style={styles.input}
        />
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.muted,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.text,
    minHeight: 48,
  },
  prefix: {
    fontFamily: fonts.money,
    fontSize: 18,
    color: colors.muted,
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontFamily: fonts.money,
    fontSize: 22,
    color: colors.text,
    paddingVertical: 8,
    letterSpacing: 0.2,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
