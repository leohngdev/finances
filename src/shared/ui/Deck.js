import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useReducedMotion } from "../motion";
import { colors, fonts } from "../theme";

const W = 108;
const H = 176;

function truckHoles(cx, cy) {
  const dx = 4.2;
  const dy = 5;
  return [
    [cx - dx, cy - dy],
    [cx + dx, cy - dy],
    [cx - dx, cy + dy],
    [cx + dx, cy + dy],
  ];
}

function DeckGraphic({ width = W, height = H }) {
  const holes = [...truckHoles(48, 42), ...truckHoles(48, 134)];
  return (
    <Svg width={width} height={height} viewBox="0 0 96 176">
      <Path
        d="M48 8c-18 0-24 14-24 30v100c0 18 10 30 24 30s24-12 24-30V38c0-16-6-30-24-30z"
        fill={colors.maple}
      />
      <Path
        d="M48 16c-14 0-17 11-17 24v96c0 14 7 22 17 22s17-8 17-22V40c0-13-3-24-17-24z"
        fill={colors.griptape}
      />
      {holes.map(([cx, cy]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7" fill={colors.maple} />
      ))}
    </Svg>
  );
}

export function MiniDeck({ size = 28 }) {
  return <DeckGraphic width={size} height={Math.round(size * (176 / 108))} />;
}

export function Deck({ onPress, label }) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  function stamp() {
    if (reduced) {
      onPress();
      return;
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <Pressable
      onPress={stamp}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.wrap}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <DeckGraphic />
      </Animated.View>
      <Text style={styles.verb}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 10,
  },
  verb: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.primary,
    letterSpacing: 0.8,
  },
});
