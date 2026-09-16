import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";
import { StyleSheet, View } from "react-native";

const DOTS = (() => {
  const items = [];
  let s = 90210;
  for (let i = 0; i < 72; i += 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const x = (s % 8000) / 100;
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const y = (s % 8000) / 100;
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const r = 0.9 + (s % 3) * 0.55;
    items.push({
      x,
      y,
      r,
      fill: s % 6 === 0 ? "#6a6358" : "#3a342c",
    });
  }
  return items;
})();

export function GriptapeFill() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="logit-cartoon-grit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {DOTS.map((dot, i) => (
              <Circle key={i} cx={dot.x} cy={dot.y} r={dot.r} fill={dot.fill} />
            ))}
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#logit-cartoon-grit)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});
