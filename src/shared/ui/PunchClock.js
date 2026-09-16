import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { Spinning, useReducedMotion } from "../motion";
import { colors, fonts } from "../theme";

const SIZE = 176;
const CX = 88;
const CY = 88;

export function PunchClock({ date, live, onPress, label }) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(0)).current;

  function stamp() {
    if (reduced) {
      onPress();
      return;
    }
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(pop, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(pop, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]),
    ]).start();
    onPress();
  }

  const ticks = Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45 - 90) * Math.PI) / 180;
    return {
      x1: CX + 58 * Math.cos(a),
      y1: CY + 58 * Math.sin(a),
      x2: CX + 70 * Math.cos(a),
      y2: CY + 70 * Math.sin(a),
    };
  });

  return (
    <Pressable
      onPress={stamp}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.wrap}
    >
      <Animated.View style={[styles.face, { transform: [{ scale }] }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pop,
            {
              opacity: pop,
              transform: [
                {
                  scale: pop.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.18],
                  }),
                },
              ],
            },
          ]}
        />
        <Spinning on={live}>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 176 176">
            <Circle cx={CX} cy={CY} r="82" fill={colors.griptape} />
            <Circle cx={CX} cy={CY} r="74" fill={live ? colors.primary : colors.maple} />
            <Circle cx={CX} cy={CY} r="62" fill={colors.bone} />
            <Circle cx={CX} cy={CY} r="54" fill={live ? colors.primary : colors.maple} />
            {ticks.map((tick, i) => (
              <Line
                key={i}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={colors.griptape}
                strokeWidth="4"
                strokeLinecap="round"
              />
            ))}
            <Circle cx={CX} cy={CY - 43} r="6.5" fill={colors.bone} />
            <Circle cx={CX} cy={CY - 43} r="3" fill={colors.griptape} />
          </Svg>
        </Spinning>
        <View pointerEvents="none" style={styles.hub}>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 176 176">
            <Circle cx={CX} cy={CY} r="22" fill={colors.griptape} />
            <Circle cx={CX} cy={CY} r="14" fill="none" stroke={colors.bone} strokeWidth="2.4" />
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const a = ((deg - 90) * Math.PI) / 180;
              return (
                <Circle
                  key={deg}
                  cx={CX + 9 * Math.cos(a)}
                  cy={CY + 9 * Math.sin(a)}
                  r="1.8"
                  fill={colors.bone}
                />
              );
            })}
            <Circle cx={CX} cy={CY} r="3.2" fill={colors.maple} />
          </Svg>
        </View>
      </Animated.View>
      <Text style={[styles.verb, live && styles.verbLive]}>{label}</Text>
      {live ? (
        <Text style={styles.time}>
          {String(date.getHours()).padStart(2, "0")}:{String(date.getMinutes()).padStart(2, "0")}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 10,
  },
  face: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  hub: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  pop: {
    position: "absolute",
    width: SIZE + 22,
    height: SIZE + 22,
    borderRadius: 99,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  verb: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: 1,
  },
  verbLive: {
    color: colors.primary,
  },
  time: {
    fontFamily: fonts.digits,
    fontSize: 14,
    color: colors.muted,
    marginTop: -6,
  },
});
