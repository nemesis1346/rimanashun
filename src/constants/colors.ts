// Minimalistic Blue Color Palette
export const colors = {
  // Primary Colors (Minimalistic)
  primary: "#1E3A8A", // Deep blue - main color
  secondary: "#3B82F6", // Medium blue - accent
  accent: "#60A5FA", // Light blue - highlights

  // Neutral Colors
  background: "#F8FAFC", // Cool off-white
  cardBackground: "#FFFFFF", // Pure white
  textPrimary: "#1E293B", // Dark blue-gray
  textSecondary: "#64748B", // Medium blue-gray
  border: "#CBD5E1", // Light blue-gray

  // Gradients (Subtle)
  primaryGradient: ["#1E3A8A", "#3B82F6"] as const, // Deep blue to medium blue
  subtleGradient: ["#F8FAFC", "#E2E8F0"] as const, // Cool white to light blue-gray
  accentGradient: ["#3B82F6", "#60A5FA"] as const, // Medium blue to light blue
};
