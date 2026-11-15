// Colors and numbers: generated from small tables rather than drawn.
import { C, eye, shadow } from "../palette.mjs";

const colorWords = [
  ["ankas|azul", "ankas", "#2563EB"],
  ["killu|amarillo", "killu", "#FACC15"],
  ["puka|rojo", "puka", "#DC2626"],
  ["pusu|plomo", "pusu", "#6B7280"],
  ["waylla|verde", "waylla", "#16A34A"],
  ["yurak|blanco", "yurak", "#FFFFFF"],
];
export const swatches = colorWords.map(([key, file, color]) => ({
  file,
  keys: [key],
  body: `
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#CBD5E1"/>
    <path d="M32 6 C46 6 56 15 56 28 C56 41 50 48 44 52 C40 55 35 56 30 55 C16 54 8 44 8 30 C8 16 18 6 32 6z" fill="${color}" stroke="${color === "#FFFFFF" ? C.stone : "rgba(0,0,0,0.18)"}" stroke-width="2.5"/>
    <ellipse cx="22" cy="20" rx="6" ry="3.5" fill="#fff" opacity="0.45" transform="rotate(-35 22 20)"/>`,
}));

// Numbers: the numeral, big and round.
const numberWords = [
  ["shuk|uno", "1"], ["ishkay|dos", "2"], ["kimsa|tres", "3"], ["chusku|cuatro", "4"],
  ["pichka|cinco", "5"], ["sukta|seis", "6"], ["kanchis|siete", "7"], ["pusak|ocho", "8"],
  ["iskun|nueve", "9"], ["chunka|diez", "10"], ["patsak|cien", "100"], ["waranka|mil", "1000"],
];
export const numerals = numberWords.map(([key, n]) => ({
  file: key.split("|")[0],
  keys: [key],
  body: `
    <rect x="6" y="6" width="52" height="52" rx="14" fill="${C.waterLight}"/>
    <text x="32" y="${n.length > 3 ? 40 : 44}" text-anchor="middle" font-family="Arial Rounded MT Bold, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="${n.length > 3 ? 17 : n.length > 2 ? 21 : n.length > 1 ? 30 : 36}" fill="#1D4ED8">${n}</text>`,
}));

