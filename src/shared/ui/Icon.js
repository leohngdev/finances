import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { colors } from "../theme";

const SIZE = 24;

export function Icon({ name, color = colors.ink, size = SIZE, stroke = 1.8 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    accessibilityElementsHidden: true,
    importantForAccessibility: "no",
  };
  const strokeProps = {
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "clock") {
    return (
      <Svg {...props}>
        <Circle cx="12" cy="12" r="8.2" {...strokeProps} />
        <Circle cx="12" cy="12" r="3.1" {...strokeProps} />
        <Circle cx="12" cy="12" r="1.15" fill={color} stroke="none" />
        <Line x1="12" y1="3.9" x2="12" y2="5.6" {...strokeProps} />
        <Line x1="20.1" y1="12" x2="18.4" y2="12" {...strokeProps} />
      </Svg>
    );
  }

  if (name === "hours") {
    const hole = { fill: color, stroke: "none" };
    return (
      <Svg {...props}>
        <Path
          d="M12 2.2c-3.5 0-4.7 1.9-4.7 4.1v11.4c0 2.2 1.2 4.1 4.7 4.1s4.7-1.9 4.7-4.1V6.3c0-2.2-1.2-4.1-4.7-4.1z"
          {...strokeProps}
        />
        <Circle cx="10.9" cy="6.55" r="0.5" {...hole} />
        <Circle cx="13.1" cy="6.55" r="0.5" {...hole} />
        <Circle cx="10.9" cy="8.05" r="0.5" {...hole} />
        <Circle cx="13.1" cy="8.05" r="0.5" {...hole} />
        <Circle cx="10.9" cy="15.95" r="0.5" {...hole} />
        <Circle cx="13.1" cy="15.95" r="0.5" {...hole} />
        <Circle cx="10.9" cy="17.45" r="0.5" {...hole} />
        <Circle cx="13.1" cy="17.45" r="0.5" {...hole} />
      </Svg>
    );
  }

  if (name === "pay") {
    return (
      <Svg {...props}>
        <Rect x="5" y="6.5" width="14" height="11" rx="1.6" {...strokeProps} />
        <Path d="M12 9.2v5.6M10.2 10.4c.4-.6 1.1-.8 1.8-.8.9 0 1.7.4 1.7 1.3 0 1.8-3.5.8-3.5 2.4 0 .8.8 1.3 1.8 1.3.8 0 1.4-.3 1.8-.8" {...strokeProps} />
      </Svg>
    );
  }

  if (name === "settings") {
    const axle = { ...strokeProps, strokeWidth: stroke * 0.95 };
    return (
      <Svg {...props}>
        <Line x1="2.6" y1="7.6" x2="21.4" y2="7.6" {...axle} />
        <Circle cx="2.6" cy="7.6" r="1.15" {...strokeProps} />
        <Circle cx="21.4" cy="7.6" r="1.15" {...strokeProps} />
        <Path
          d="M6.4 7.6c.2-1.8 1.8-2.8 3.6-2.8h4c1.8 0 3.4 1 3.6 2.8 0 1.4-1.2 2.2-2.4 2.2h-1.1c-.4 0-.7.5-.9 1.2-.2.8-.6 1.3-1.2 1.3s-1-.5-1.2-1.3c-.2-.7-.5-1.2-.9-1.2H8.8C7.6 9.8 6.4 9 6.4 7.6z"
          {...strokeProps}
        />
        <Path d="M9.2 13.6h5.6L16.4 16v4.2c0 .5-.4.9-.9.9H8.5c-.5 0-.9-.4-.9-.9V16z" {...strokeProps} />
        <Circle cx="10.35" cy="17.15" r="0.45" fill={color} stroke="none" />
        <Circle cx="13.65" cy="17.15" r="0.45" fill={color} stroke="none" />
        <Circle cx="10.35" cy="19.05" r="0.45" fill={color} stroke="none" />
        <Circle cx="13.65" cy="19.05" r="0.45" fill={color} stroke="none" />
      </Svg>
    );
  }

  if (name === "plus") {
    return (
      <Svg {...props}>
        <Line x1="12" y1="6.5" x2="12" y2="17.5" {...strokeProps} />
        <Line x1="6.5" y1="12" x2="17.5" y2="12" {...strokeProps} />
      </Svg>
    );
  }

  if (name === "check") {
    return (
      <Svg {...props}>
        <Path d="M6.5 12.2l3.4 3.3 7.6-7.8" {...strokeProps} />
      </Svg>
    );
  }

  return null;
}
