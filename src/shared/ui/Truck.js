import { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path, Polygon, Rect } from "react-native-svg";
import { useReducedMotion } from "../motion";
import { colors } from "../theme";

function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i += 1) {
    const a = ((30 + i * 60) * Math.PI) / 180;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(" ");
}

export function Truck() {
  const ink = {
    stroke: colors.ink,
    strokeWidth: 3,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  };
  const holes = [
    [114, 122],
    [166, 122],
    [114, 144],
    [166, 144],
  ];
  return (
    <View style={styles.hero} accessibilityElementsHidden importantForAccessibility="no">
      <Svg width={280} height={168} viewBox="0 0 280 168">
        <Rect x="20" y="44" width="240" height="8" rx="4" fill={colors.maple} stroke={colors.ink} strokeWidth="2.4" />
        {[28, 32, 36, 40, 240, 244, 248, 252].map((x) => (
          <Line key={x} x1={x} y1="45.5" x2={x} y2="50.5" stroke={colors.ink} strokeWidth="1.3" />
        ))}

        <Circle cx="50" cy="48" r="7" fill={colors.maple} stroke={colors.ink} strokeWidth="2.2" />
        <Circle cx="230" cy="48" r="7" fill={colors.maple} stroke={colors.ink} strokeWidth="2.2" />

        <Path
          d="M126 100H154L168 112H176Q180 112 180 116V150Q180 158 172 158H108Q100 158 100 150V116Q100 112 104 112H112Z"
          fill={colors.primary}
          {...ink}
        />
        {holes.map(([cx, cy]) => (
          <Circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="3.6"
            fill={colors.maple}
            stroke={colors.ink}
            strokeWidth="1.6"
          />
        ))}

        <Path
          d="M50 48
             C52 34 68 29 90 29
             H190
             C212 29 228 34 230 48
             C228 62 212 67 190 67
             H166
             C160 67 158 78 156 86
             C154 90 150 90 148 86
             C146 78 144 68 140 66
             C136 68 134 78 132 86
             C130 90 126 90 124 86
             C122 78 120 67 114 67
             H90
             C68 67 52 62 50 48Z"
          fill={colors.griptape}
          {...ink}
        />

        <Rect
          x="122"
          y="82"
          width="36"
          height="20"
          rx="10"
          fill={colors.teal}
          stroke={colors.ink}
          strokeWidth="2.6"
        />

        <Polygon
          points={hexPoints(140, 70, 8)}
          fill={colors.maple}
          stroke={colors.ink}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <Circle cx="140" cy="70" r="2.2" fill={colors.ink} />

        <Polygon
          points={hexPoints(20, 48, 10)}
          fill={colors.griptape}
          stroke={colors.ink}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <Circle cx="20" cy="48" r="2.8" fill={colors.maple} />
        <Polygon
          points={hexPoints(260, 48, 10)}
          fill={colors.griptape}
          stroke={colors.ink}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <Circle cx="260" cy="48" r="2.8" fill={colors.maple} />
      </Svg>
    </View>
  );
}

export function NutButton({ onPress, direction, accessibilityLabel }) {
  const reduced = useReducedMotion();
  const nudge = useRef(new Animated.Value(0)).current;
  const prev = direction === "prev";

  function stamp() {
    if (reduced) {
      onPress();
      return;
    }
    Animated.sequence([
      Animated.timing(nudge, {
        toValue: prev ? -8 : 8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(nudge, { toValue: 0, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  const nut = (
    <Svg width={40} height={40} viewBox="0 0 48 48">
      <Polygon
        points="24,4 42,14 42,34 24,44 6,34 6,14"
        fill={colors.maple}
        stroke={colors.ink}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <Circle cx="24" cy="24" r="6" fill={colors.griptape} />
      <Circle cx="24" cy="24" r="2.2" fill={colors.ink} />
    </Svg>
  );

  const chevron = (
    <Svg width={12} height={18} viewBox="0 0 12 18">
      <Path
        d={prev ? "M8.5 3L3 9l5.5 6" : "M3.5 3L9 9l-5.5 6"}
        fill="none"
        stroke={colors.primary}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <Pressable
      onPress={stamp}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={styles.nutWrap}
    >
      <Animated.View style={[styles.nutHit, { transform: [{ translateX: nudge }] }]}>
        {prev ? chevron : null}
        {nut}
        {prev ? null : chevron}
      </Animated.View>
    </Pressable>
  );
}

export function BoltMark() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx="6" cy="6" r="5" fill={colors.maple} stroke={colors.ink} strokeWidth="1.2" />
      <Circle cx="6" cy="6" r="1.7" fill={colors.ink} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    marginTop: -4,
    marginBottom: -4,
  },
  nutWrap: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  nutHit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
