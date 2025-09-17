import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

// Mountain icon representing the Andes
export const MountainIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#1E3A8A",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M2,20 L6,12 L10,16 L14,8 L18,12 L22,20 Z"
      fill={color}
      opacity={0.8}
    />
    <Circle cx="12" cy="10" r="1" fill="#3B82F6" />
  </Svg>
);

// Sun icon representing Inti (Inca sun god)
export const SunIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#3B82F6",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="6" fill={color} />
    <Path
      d="M12,2 L12,4 M12,20 L12,22 M2,12 L4,12 M20,12 L22,12"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="M4.93,4.93 L6.34,6.34 M17.66,17.66 L19.07,19.07"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="M19.07,4.93 L17.66,6.34 M6.34,17.66 L4.93,19.07"
      stroke={color}
      strokeWidth="2"
    />
  </Svg>
);

// Leaf icon representing Amazon plants
export const LeafIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#1E3A8A",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12,2 C8,2 4,6 4,12 C4,18 8,22 12,22 C16,22 20,18 20,12 C20,6 16,2 12,2 Z"
      fill={color}
      opacity={0.7}
    />
    <Path
      d="M12,4 L12,20 M8,8 L16,16 M8,16 L16,8"
      stroke="#87CEEB"
      strokeWidth="1"
    />
  </Svg>
);

// Traditional house icon
export const HouseIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#1E3A8A",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3,20 L3,10 L12,3 L21,10 L21,20 Z" fill={color} />
    <Rect x="9" y="14" width="6" height="6" fill="#3B82F6" />
    <Circle cx="12" cy="17" r="1" fill="#3B82F6" />
  </Svg>
);

// Woven basket pattern
export const BasketIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#3B82F6",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4,8 L20,8 L18,20 L6,20 Z" fill={color} />
    <Path d="M4,8 L4,6 L20,6 L20,8" fill="#1E3A8A" />
    <Path
      d="M8,10 L16,10 M8,12 L16,12 M8,14 L16,14 M8,16 L16,16"
      stroke="#1E3A8A"
      strokeWidth="1"
    />
  </Svg>
);

// Growing plant icon
export const PlantIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#1E3A8A",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12,20 L12,8 M8,12 L12,8 L16,12" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="6" r="2" fill="#3B82F6" />
    <Path d="M10,20 L14,20" stroke="#1E3A8A" strokeWidth="3" />
  </Svg>
);

// Traditional book/scroll icon
export const BookIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#1E3A8A",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4,4 L20,4 L20,20 L4,20 Z" fill={color} />
    <Path
      d="M6,6 L18,6 M6,9 L18,9 M6,12 L18,12 M6,15 L18,15"
      stroke="#F5F5DC"
      strokeWidth="1"
    />
    <Circle cx="12" cy="18" r="1" fill="#3B82F6" />
  </Svg>
);
