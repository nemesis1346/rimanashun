// Shared palette and helpers for the hand-drawn quiz pictures in ./icons/.
//
// Style guide (keep new icons consistent):
// - 64x64 viewBox, flat fills, no outlines except where a light object needs
//   one to show on a white card (stroke #CBD5E1 / #A8A29E, 1.5px)
// - one darker shade of the main color for depth, soft ground shadow
// - colors from the palette below; Andean motifs (zigzag bands) where natural
//
// `keys` are the words this picture is for, as `kichwa|spanish` (readable;
// build.mjs resolves each to its word id through vocabulary.json). Words with a
// doubtful gloss are left out on purpose; see docs/vocabulary-data-issues.md.

export const C = {
  ink: "#1E293B",
  water: "#60A5FA", waterDark: "#3B82F6", waterLight: "#DBEAFE",
  stone: "#94A3B8", stoneDark: "#64748B", snow: "#F8FAFC",
  grass: "#86EFAC", leaf: "#22C55E", leafDark: "#15803D",
  clay: "#C2410C", clayDark: "#9A3412", clayLight: "#FDBA74",
  crust: "#C98A45", crustDark: "#9C6430", crumb: "#F3D9A4",
  cream: "#FDF6E3", creamEdge: "#E5D3B3",
  skin: "#E8B48A", skinDark: "#C98E65",
  brown: "#B45309", brownDark: "#78350F", muzzle: "#FDE7C7",
  red: "#DC2626", yellow: "#F59E0B", pink: "#F472B6", pinkLight: "#F9A8D4",
  outline: "#CBD5E1", shadow: "#E2E8F0",
};

export const shadow = (cx = 32, cy = 59, rx = 18) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="3" fill="${C.shadow}"/>`;
export const eye = (cx, cy, r = 2.7) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.ink}"/><circle cx="${cx + r * 0.3}" cy="${cy - r * 0.3}" r="${r * 0.33}" fill="#fff"/>`;

