import { createElement, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Platform } from "react-native";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const sync = () => setReduced(media.matches);
      sync();
      if (media.addEventListener) media.addEventListener("change", sync);
      else media.addListener(sync);
      return () => {
        if (media.removeEventListener) media.removeEventListener("change", sync);
        else media.removeListener(sync);
      };
    }
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => sub && sub.remove && sub.remove();
  }, []);

  return reduced;
}

let spinKeyframesReady = false;

function ensureSpinKeyframes() {
  if (spinKeyframesReady || Platform.OS !== "web" || typeof document === "undefined") return;
  spinKeyframesReady = true;
  const style = document.createElement("style");
  style.setAttribute("data-logit", "wheel-spin");
  style.textContent =
    "@keyframes logit-wheel-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}" +
    ".logit-wheel-spinning{animation:logit-wheel-spin 2.8s linear infinite}";
  document.head.appendChild(style);
}

export function Spinning({ on, duration = 2800, children, style }) {
  const reduced = useReducedMotion();
  const spinning = Boolean(on) && !reduced;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ensureSpinKeyframes();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;
    if (!spinning) {
      spin.stopAnimation();
      spin.setValue(0);
      return undefined;
    }
    spin.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      })
    );
    loop.start();
    return () => {
      loop.stop();
      spin.stopAnimation();
      spin.setValue(0);
    };
  }, [spinning, duration, spin]);

  if (Platform.OS === "web") {
    return createElement(
      "div",
      {
        className: spinning ? "logit-wheel-spinning" : undefined,
        style: { display: "flex", alignItems: "center", justifyContent: "center" },
      },
      children
    );
  }

  return (
    <Animated.View
      style={[
        style,
        spinning
          ? {
              transform: [
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }
          : null,
      ]}
    >
      {children}
    </Animated.View>
  );
}
