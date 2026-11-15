// Household objects, tools, clothing and buildings.
import { C, eye, shadow } from "../palette.mjs";

// A small building: walls, roof, door. Used for school, clinic, church.
const building = ({ wall, roof, extra = "" }) => `
    ${shadow(32, 59, 26)}
    <rect x="12" y="30" width="40" height="28" fill="${wall}"/>
    <path d="M8 31 L32 14 L56 31z" fill="${roof}"/>
    <rect x="27" y="42" width="10" height="16" rx="1.5" fill="${C.brownDark}"/>
    <rect x="16" y="36" width="8" height="7" rx="1" fill="${C.waterLight}" stroke="${C.stone}" stroke-width="1"/>
    <rect x="40" y="36" width="8" height="7" rx="1" fill="${C.waterLight}" stroke="${C.stone}" stroke-width="1"/>
    ${extra}`;

// Andean diamond band, for woven things (belt, bag, fabric).
const diamonds = (x0, y, n, step, size, color) =>
  Array.from({ length: n }, (_, i) => {
    const x = x0 + i * step;
    return `<path d="M${x} ${y - size} L${x + size} ${y} L${x} ${y + size} L${x - size} ${y}z" fill="${color}"/>`;
  }).join("");

export const objects = [
  { file: "manka", keys: ["manka|olla"], body: `
    ${shadow(32, 59, 18)}
    <path d="M25 15 c-3-3 3-5 0-9 M39 15 c-3-3 3-5 0-9" stroke="#CBD5E1" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <rect x="4" y="30" width="10" height="6" rx="3" fill="${C.clayDark}"/>
    <rect x="50" y="30" width="10" height="6" rx="3" fill="${C.clayDark}"/>
    <path d="M13 25 H51 C51 44 44 56 32 56 C20 56 13 44 13 25z" fill="${C.clay}"/>
    <path d="M18 39 l4-4 l4 4 l4-4 l4 4 l4-4 l4 4 l4-4" stroke="${C.clayLight}" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <rect x="9" y="19" width="46" height="8" rx="4" fill="${C.clayDark}"/>` },

  // ---- clothing ----
  { file: "anaku", keys: ["anaku|falda"], body: `
    <path d="M16 15 H48 L56 55 H8z" fill="#1E293B"/>
    <path d="M38 15 L44 55" stroke="#334155" stroke-width="2.5"/>
    <path d="M8 55 H56 L57 59 H7z" fill="#F8FAFC" stroke="${C.outline}" stroke-width="1.2"/>
    <rect x="15" y="8" width="34" height="8" rx="2" fill="${C.red}"/>
    ${diamonds(19, 12, 6, 5.2, 2.2, "#FACC15")}` },

  { file: "balun", keys: ["balun|pantalon"], body: `
    <path d="M18 7 H46 L50 58 H36 L32 26 L28 58 H14z" fill="#2563EB"/>
    <rect x="18" y="7" width="28" height="6" fill="#1D4ED8"/>
    <path d="M32 13 V24 M22 13 v6 M42 13 v6" stroke="#1D4ED8" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M14 54 H28 M36 54 H50" stroke="#1D4ED8" stroke-width="2"/>` },

  { file: "chunpi", keys: ["chunpi|faja"], body: `
    <path d="M4 26 C20 20 44 32 60 26 V40 C44 46 20 34 4 40z" fill="${C.red}"/>
    <path d="M4 28.5 C20 22.5 44 34.5 60 28.5 M4 37.5 C20 31.5 44 43.5 60 37.5" stroke="${C.leafDark}" stroke-width="1.6" fill="none"/>
    <g fill="#FACC15">
      ${[10, 20, 30, 40, 50].map((x, i) => { const y = 33 + Math.sin((x - 4) / 56 * Math.PI * 2) * -3; return `<path d="M${x} ${y - 3.2} L${x + 3.2} ${y} L${x} ${y + 3.2} L${x - 3.2} ${y}z"/>`; }).join("")}
    </g>
    <path d="M4 40 l-2 8 M7 40 l-1 8 M60 26 l2 -8 M57 27 l1 -8" stroke="${C.red}" stroke-width="1.6" stroke-linecap="round"/>` },

  { file: "pargati", keys: ["pargati|alpargate", "parkati|alpargate"], body: `
    ${shadow(32, 57, 26)}
    <path d="M6 48 C6 44 10 42 16 42 H52 C58 42 60 46 58 50 C57 53 54 54 50 54 H12 C8 54 6 52 6 48z" fill="#D6A86C"/>
    <path d="M7 50 H58" stroke="#B7793B" stroke-width="1.4" stroke-dasharray="2 2"/>
    <path d="M14 43 C14 32 22 28 30 28 C38 28 46 34 52 43z" fill="#F8FAFC" stroke="${C.outline}" stroke-width="1.5"/>
    <path d="M22 32 L44 41 M26 30 L48 42" stroke="#1E293B" stroke-width="1.6" stroke-linecap="round"/>` },

  { file: "ruwana", keys: ["ruwana|poncho"], body: `
    <path d="M32 8 L58 30 L52 54 H12 L6 30z" fill="#1E3A8A"/>
    <path d="M32 8 L58 30 L55 42 L32 22 L9 42 L6 30z" fill="#1E40AF"/>
    <path d="M12 47 H52 M13 51 H51" stroke="${C.water}" stroke-width="1.8"/>
    <ellipse cx="32" cy="15" rx="6.5" ry="3.2" fill="#0F172A"/>
    <path d="M14 54 v5 M18 54 v5 M22 54 v5 M26 54 v5 M30 54 v5 M34 54 v5 M38 54 v5 M42 54 v5 M46 54 v5 M50 54 v5" stroke="#1E3A8A" stroke-width="1.6" stroke-linecap="round"/>` },

  { file: "kushma", keys: ["kushma|chaleco"], body: `
    <path d="M20 8 L28 8 L32 28 L36 8 L44 8 L52 18 L50 56 H14 L12 18z" fill="${C.brown}"/>
    <path d="M32 28 V56" stroke="${C.brownDark}" stroke-width="1.6"/>
    <g fill="#FACC15"><circle cx="35" cy="34" r="1.6"/><circle cx="35" cy="42" r="1.6"/><circle cx="35" cy="50" r="1.6"/></g>
    <path d="M12 18 C16 22 18 26 18 30 M52 18 C48 22 46 26 46 30" stroke="${C.brownDark}" stroke-width="1.6" fill="none"/>
    <rect x="16" y="40" width="9" height="2" rx="1" fill="${C.brownDark}"/>` },

  { file: "muchiku", keys: ["muchiku|sombrero"], body: `
    ${shadow(32, 50, 26)}
    <ellipse cx="32" cy="44" rx="28" ry="7" fill="#334155"/>
    <path d="M16 44 C16 30 18 18 32 18 C46 18 48 30 48 44z" fill="#475569"/>
    <path d="M24 19 Q32 25 40 19" stroke="#334155" stroke-width="2" fill="none"/>
    <rect x="16.5" y="36" width="31" height="5" fill="${C.brownDark}"/>
    <ellipse cx="32" cy="44" rx="16" ry="2" fill="#1E293B" opacity="0.5"/>` },

  { file: "wallka", keys: ["wallka|collar"], body: `
    <path d="M14 8 C14 18 18 24 22 26 M50 8 C50 18 46 24 42 26" stroke="${C.stone}" stroke-width="1.5" fill="none"/>
    ${[13, 18, 23].map((r, row) => Array.from({ length: 9 + row * 2 }, (_, i) => {
      const n = 9 + row * 2; const a = Math.PI * (0.08 + 0.84 * i / (n - 1));
      return `<circle cx="${(32 + Math.cos(a) * r * 1.15).toFixed(1)}" cy="${(24 + Math.sin(a) * r).toFixed(1)}" r="2.6" fill="#FACC15" stroke="#CA8A04" stroke-width="0.9"/>`;
    }).join("")).join("")}` },

  { file: "shikra", keys: ["shikra|mochila"], body: `
    ${shadow(32, 59, 18)}
    <path d="M19 28 C19 6 45 6 45 28" stroke="#92400E" stroke-width="3.5" fill="none"/>
    <path d="M13 26 H51 C53 44 47 57 32 57 C17 57 11 44 13 26z" fill="${C.yellow}"/>
    <path d="M13.4 34 H50.6 M14.5 44 H49.5" stroke="${C.red}" stroke-width="4"/>
    <path d="M16 39 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3" stroke="${C.leafDark}" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
    <path d="M18 50 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3" stroke="#7C3AED" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
    <rect x="12" y="24" width="40" height="4" rx="2" fill="#92400E"/>` },

  { file: "runpa", keys: ["runpa|guantes"], body: `
    ${[[22, -10, "#DC2626"], [42, 10, "#2563EB"]].map(([x, rot, col]) => `
    <g transform="rotate(${rot} ${x} 34)">
      <rect x="${x - 9}" y="20" width="18" height="26" rx="9" fill="${col}"/>
      <rect x="${x - 12}" y="26" width="7" height="13" rx="3.5" fill="${col}" transform="rotate(-25 ${x - 8} 32)"/>
      <rect x="${x - 9}" y="44" width="18" height="10" rx="2" fill="#F8FAFC" stroke="${C.outline}" stroke-width="1.2"/>
      <path d="M${x - 9} 49 h18" stroke="${col}" stroke-width="1.5"/>
      <path d="M${x - 5} 32 l5 -4 l5 4 M${x - 5} 38 l5 -4 l5 4" stroke="#fff" stroke-width="1.4" fill="none" opacity="0.8"/>
    </g>`).join("")}` },

  { file: "pintu", keys: ["pintu|tela"], body: `
    ${shadow(32, 58, 26)}
    <rect x="8" y="42" width="48" height="12" rx="2" fill="#7C3AED"/>
    <rect x="10" y="31" width="44" height="12" rx="2" fill="${C.red}"/>
    <rect x="12" y="20" width="40" height="12" rx="2" fill="${C.leaf}"/>
    ${diamonds(17, 26, 6, 6, 2.4, "#FEF9C3")}
    ${diamonds(15, 37, 7, 5.6, 2.2, "#FACC15")}
    <path d="M10 48 H54" stroke="#C4B5FD" stroke-width="2" stroke-dasharray="4 3"/>` },

  { file: "kururu", keys: ["kururu|cono de hilo"], body: `
    ${shadow(30, 58, 16)}
    <path d="M24 10 H36 L46 54 H14z" fill="#F472B6"/>
    ${[16, 22, 28, 34, 40, 46].map((y) => `<path d="M${30 - (y - 10) * 0.36} ${y} Q30 ${y + 2.5} ${30 + (y - 10) * 0.36} ${y}" stroke="#DB2777" stroke-width="1.3" fill="none"/>`).join("")}
    <rect x="12" y="52" width="36" height="5" rx="2" fill="#D6A86C"/>
    <rect x="25" y="6" width="10" height="5" rx="2" fill="#D6A86C"/>
    <path d="M44 40 C52 40 56 46 54 52 C53 56 56 58 59 57" stroke="#F472B6" stroke-width="1.8" fill="none" stroke-linecap="round"/>` },

  // ---- buildings and rooms ----
  { file: "yachana-wasi", keys: ["yachana wasi|escuela"], body: building({ wall: "#FDE68A", roof: C.clay, extra: `
    <path d="M32 14 V3" stroke="${C.stoneDark}" stroke-width="1.6"/>
    <rect x="32" y="3" width="12" height="2.6" fill="#FACC15"/><rect x="32" y="5.6" width="12" height="1.7" fill="#2563EB"/><rect x="32" y="7.3" width="12" height="1.7" fill="#DC2626"/>
    <circle cx="32" cy="25" r="3.2" fill="#fff" stroke="${C.stoneDark}" stroke-width="1"/><path d="M32 23.3 V25 h1.4" stroke="${C.ink}" stroke-width="0.9" fill="none"/>` }) },

  { file: "hanpi-wasi", keys: ["hanpi wasi|centro de salud"], body: building({ wall: "#F8FAFC", roof: C.waterDark, extra: `
    <rect x="12" y="30" width="40" height="28" fill="none" stroke="${C.outline}" stroke-width="1.2"/>
    <circle cx="32" cy="24" r="6.5" fill="#fff"/>
    <path d="M32 19.5 V28.5 M27.5 24 H36.5" stroke="#DC2626" stroke-width="3.2"/>` }) },

  { file: "apunchikpa-wasi", keys: ["apunchikpa wasi|casa de dios"], body: `
    ${shadow(32, 59, 26)}
    <rect x="10" y="34" width="44" height="24" fill="#FEF3C7"/>
    <path d="M6 35 L32 22 L58 35z" fill="${C.clay}"/>
    <rect x="25" y="14" width="14" height="44" fill="#FDE68A"/>
    <path d="M23 15 L32 6 L41 15z" fill="${C.clayDark}"/>
    <path d="M32 1 V7 M29.5 3.2 H34.5" stroke="${C.brownDark}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M28 58 V46 a4 4 0 0 1 8 0 V58z" fill="${C.brownDark}"/>
    <circle cx="32" cy="24" r="3.5" fill="${C.waterLight}" stroke="${C.stone}" stroke-width="1"/>
    <rect x="14" y="40" width="6" height="8" rx="3" fill="${C.waterLight}"/><rect x="44" y="40" width="6" height="8" rx="3" fill="${C.waterLight}"/>` },

  { file: "patakunawan-wasi", keys: ["patakunawan wasi|edificio con muchos pisos"], body: `
    ${shadow(32, 59, 22)}
    <rect x="16" y="6" width="32" height="52" fill="${C.stone}"/>
    <rect x="16" y="6" width="32" height="4" fill="${C.stoneDark}"/>
    ${[13, 21, 29, 37, 45].map((y) => [20, 29, 38].map((x) => `<rect x="${x}" y="${y}" width="6" height="5" rx="0.8" fill="${C.waterLight}"/>`).join("")).join("")}
    <rect x="28" y="51" width="8" height="7" fill="${C.stoneDark}"/>` },

  { file: "pununa-uku", keys: ["puñuna uku|dormitorio"], body: `
    ${shadow(32, 58, 28)}
    <rect x="6" y="20" width="6" height="36" rx="2" fill="#92400E"/>
    <rect x="52" y="34" width="6" height="22" rx="2" fill="#92400E"/>
    <rect x="10" y="38" width="46" height="10" rx="2" fill="#F8FAFC" stroke="${C.outline}" stroke-width="1.2"/>
    <rect x="13" y="30" width="14" height="9" rx="4" fill="#fff" stroke="${C.outline}" stroke-width="1.2"/>
    <path d="M24 37 H54 a2 2 0 0 1 2 2 V48 H24z" fill="#3B82F6"/>
    <path d="M30 37 V48 M38 37 V48 M46 37 V48" stroke="#60A5FA" stroke-width="1.2"/>` },

  { file: "armana-uku", keys: ["armana uku|baño"], body: `
    ${shadow(32, 59, 18)}
    <rect x="18" y="6" width="28" height="18" rx="3" fill="#F8FAFC" stroke="${C.stone}" stroke-width="1.5"/>
    <rect x="36" y="9" width="6" height="3" rx="1.5" fill="${C.stone}"/>
    <path d="M12 30 H52 C52 40 46 46 38 47 L40 57 H24 L26 47 C18 46 12 40 12 30z" fill="#F8FAFC" stroke="${C.stone}" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="32" cy="29" rx="21" ry="4" fill="#E2E8F0" stroke="${C.stone}" stroke-width="1.5"/>
    <ellipse cx="32" cy="29" rx="13" ry="2" fill="${C.waterLight}"/>` },

  { file: "samarina-uku", keys: ["samarina uku|sala"], body: `
    ${shadow(32, 58, 28)}
    <rect x="12" y="18" width="40" height="20" rx="6" fill="${C.leafDark}"/>
    <rect x="12" y="34" width="40" height="12" rx="3" fill="${C.leaf}"/>
    <path d="M32 34 V46" stroke="${C.leafDark}" stroke-width="1.4"/>
    <rect x="5" y="28" width="10" height="22" rx="5" fill="${C.leafDark}"/>
    <rect x="49" y="28" width="10" height="22" rx="5" fill="${C.leafDark}"/>
    <rect x="9" y="50" width="3" height="6" fill="${C.brownDark}"/><rect x="52" y="50" width="3" height="6" fill="${C.brownDark}"/>` },

  { file: "yanuna-uku", keys: ["yanuna uku|cocina"], body: `
    ${shadow(32, 59, 22)}
    <rect x="12" y="18" width="40" height="40" rx="3" fill="#F8FAFC" stroke="${C.stone}" stroke-width="1.5"/>
    <rect x="12" y="18" width="40" height="7" fill="#E2E8F0"/>
    <circle cx="17" cy="21.5" r="1.5" fill="${C.stoneDark}"/><circle cx="23" cy="21.5" r="1.5" fill="${C.stoneDark}"/>
    <rect x="17" y="30" width="30" height="22" rx="2" fill="#1E293B"/>
    <rect x="20" y="33" width="24" height="12" rx="1.5" fill="#334155"/>
    <rect x="23" y="47" width="18" height="2.2" rx="1.1" fill="${C.stone}"/>
    <path d="M20 16 c-3 -3 1 -7 3 -9 c1 3 4 5 1 9z M40 16 c-3 -3 1 -7 3 -9 c1 3 4 5 1 9z" fill="${C.water}"/>
    <rect x="14" y="15" width="14" height="3" rx="1" fill="${C.stoneDark}"/><rect x="34" y="15" width="14" height="3" rx="1" fill="${C.stoneDark}"/>` },

  { file: "tullpa", keys: ["tullpa|fogon"], body: `
    <path d="M14 52 L50 44 M14 44 L50 52" stroke="#92400E" stroke-width="5" stroke-linecap="round"/>
    <path d="M32 10 C38 18 46 24 44 36 C43 44 38 48 32 48 C26 48 21 44 20 36 C19 28 24 26 26 20 C28 24 30 26 32 26 C32 20 30 16 32 10z" fill="#F97316"/>
    <path d="M32 26 C36 30 40 34 39 40 C38 45 35 47 32 47 C29 47 26 45 25 40 C25 36 28 34 29 30 C30 32 31 33 32 33z" fill="#FACC15"/>
    <g fill="${C.stoneDark}"><ellipse cx="10" cy="52" rx="7" ry="5"/><ellipse cx="54" cy="52" rx="7" ry="5"/><ellipse cx="32" cy="57" rx="8" ry="4.5"/></g>` },

  // ---- objects ----
  { file: "kamuti", keys: ["kamuti|libro"], body: `
    ${shadow(32, 56, 26)}
    <path d="M32 16 C24 11 14 11 6 14 V50 C14 47 24 47 32 52z" fill="#fff" stroke="${C.stone}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M32 16 C40 11 50 11 58 14 V50 C50 47 40 47 32 52z" fill="#F8FAFC" stroke="${C.stone}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M11 22 C17 20 23 20 28 22 M11 28 C17 26 23 26 28 28 M11 34 C17 32 23 32 28 34 M36 22 C41 20 47 20 53 22 M36 28 C41 26 47 26 53 28 M36 34 C41 32 47 32 53 34" stroke="${C.outline}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M6 50 C14 47 24 47 32 52 C40 47 50 47 58 50 V54 C50 51 40 51 32 56 C24 51 14 51 6 54z" fill="#2563EB"/>` },

  { file: "chakana", keys: ["chakana|escalera"], body: `
    <rect x="16" y="4" width="5" height="56" rx="2" fill="#B45309"/>
    <rect x="43" y="4" width="5" height="56" rx="2" fill="#B45309"/>
    ${[10, 20, 30, 40, 50].map((y) => `<rect x="19" y="${y}" width="26" height="4" rx="1.5" fill="#D97706"/>`).join("")}` },

  { file: "antawa", keys: ["antawa|carro, auto"], body: `
    ${shadow(32, 54, 28)}
    <path d="M4 42 C4 36 8 34 14 33 L20 22 C21 20 23 19 26 19 H42 C45 19 47 20 49 23 L54 33 C58 34 60 37 60 42 V46 a2 2 0 0 1-2 2 H6 a2 2 0 0 1-2-2z" fill="#DC2626"/>
    <path d="M22 31 L26 23 H33 V31z M36 23 H42 C43 23 44 24 45 25 L48 31 H36z" fill="${C.waterLight}"/>
    <rect x="4" y="38" width="5" height="3" rx="1" fill="#FACC15"/><rect x="55" y="38" width="5" height="3" rx="1" fill="#F8FAFC"/>
    ${[17, 47].map((x) => `<circle cx="${x}" cy="48" r="7" fill="#1E293B"/><circle cx="${x}" cy="48" r="3" fill="${C.stone}"/>`).join("")}` },

  { file: "kullki", keys: ["kullki|dinero"], body: `
    ${shadow(32, 58, 26)}
    <rect x="6" y="14" width="40" height="24" rx="3" fill="#86EFAC" stroke="${C.leafDark}" stroke-width="1.5" transform="rotate(-8 26 26)"/>
    <circle cx="26" cy="26" r="6.5" fill="none" stroke="${C.leafDark}" stroke-width="1.5" transform="rotate(-8 26 26)"/>
    <path d="M28.2 22.5 c-1 -1.2 -4.6 -1.4 -4.8 0.6 c-0.3 2.6 5.4 1.4 5.2 4.2 c-0.2 2.2 -4.2 2 -5.4 0.6 M26 21 V31" stroke="${C.leafDark}" stroke-width="1.5" fill="none" stroke-linecap="round" transform="rotate(-8 26 26)"/>
    ${[56, 51, 46, 41].map((y) => `<ellipse cx="46" cy="${y}" rx="11" ry="4" fill="#FACC15" stroke="#CA8A04" stroke-width="1.3"/>`).join("")}` },

  { file: "kipi", keys: ["kipi|maleta"], body: `
    ${shadow(32, 59, 24)}
    <path d="M25 18 V12 a3 3 0 0 1 3-3 H36 a3 3 0 0 1 3 3 V18" stroke="#78350F" stroke-width="3" fill="none"/>
    <rect x="8" y="18" width="48" height="38" rx="5" fill="#B45309"/>
    <rect x="8" y="18" width="48" height="8" rx="4" fill="#92400E"/>
    <rect x="18" y="18" width="4" height="38" fill="#78350F"/><rect x="42" y="18" width="4" height="38" fill="#78350F"/>
    <rect x="29" y="23" width="6" height="5" rx="1" fill="#FACC15"/>` },

  { file: "lampa", keys: ["lampa|pala"], body: `
    <rect x="29.5" y="4" width="5" height="34" rx="2" fill="#B45309"/>
    <path d="M24 4 H40 V9 H24z" fill="#92400E"/>
    <path d="M22 38 H42 V48 C42 55 37 60 32 60 C27 60 22 55 22 48z" fill="${C.stone}"/>
    <path d="M22 38 H42 V42 H22z" fill="${C.stoneDark}"/>
    <path d="M27 45 V54" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>` },

  { file: "puku", keys: ["puku|plato"], body: `
    ${shadow(32, 58, 24)}
    <ellipse cx="32" cy="38" rx="28" ry="16" fill="#F8FAFC" stroke="${C.stone}" stroke-width="1.5"/>
    <ellipse cx="32" cy="38" rx="21" ry="11" fill="#fff" stroke="#E2E8F0" stroke-width="1.5"/>
    <ellipse cx="32" cy="38" rx="25" ry="13.5" fill="none" stroke="#2563EB" stroke-width="1.8" stroke-dasharray="3 3"/>` },

  { file: "shila", keys: ["shila|vaso", "shilla|vaso"], body: `
    ${shadow(32, 60, 14)}
    <path d="M18 10 H46 L42 57 a3 3 0 0 1-3 3 H25 a3 3 0 0 1-3-3z" fill="#F0F9FF" stroke="${C.stone}" stroke-width="1.6"/>
    <path d="M19.8 28 H44.2 L42 57 a3 3 0 0 1-3 3 H25 a3 3 0 0 1-3-3z" fill="${C.water}"/>
    <path d="M19.8 28 H44.2" stroke="${C.waterLight}" stroke-width="2"/>
    <path d="M24 14 L26 52" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>` },

  { file: "kallana", keys: ["kallana|tiesto, sarten"], body: `
    ${shadow(30, 52, 26)}
    <rect x="40" y="31" width="22" height="6" rx="3" fill="${C.brownDark}" transform="rotate(-12 40 34)"/>
    <ellipse cx="26" cy="40" rx="23" ry="10" fill="${C.clayDark}"/>
    <ellipse cx="26" cy="37" rx="23" ry="9" fill="${C.clay}"/>
    <ellipse cx="26" cy="37" rx="18" ry="6" fill="${C.clayDark}"/>
    <g fill="#FACC15"><circle cx="20" cy="36" r="2"/><circle cx="26" cy="38" r="2"/><circle cx="31" cy="35" r="2"/><circle cx="24" cy="34" r="1.8"/><circle cx="33" cy="39" r="1.8"/></g>` },

  { file: "wisha", keys: ["wisha|cucharon"], body: `
    <rect x="34" y="2" width="6" height="40" rx="3" fill="#B45309" transform="rotate(30 37 22)"/>
    <path d="M8 40 C8 52 16 58 24 58 C32 58 40 52 40 40z" fill="#D97706"/>
    <ellipse cx="24" cy="40" rx="16" ry="4" fill="#92400E"/>
    <path d="M14 46 C16 52 20 54 24 54" stroke="#FBBF24" stroke-width="2" fill="none" stroke-linecap="round"/>` },

  { file: "wirwila", keys: ["wirwila|guitarra"], body: `
    <g transform="rotate(35 32 32)">
      <rect x="29" y="2" width="6" height="30" rx="1.5" fill="#78350F"/>
      <rect x="27" y="0" width="10" height="8" rx="2" fill="#451A03"/>
      <circle cx="32" cy="38" r="11" fill="#D97706"/>
      <circle cx="32" cy="52" r="13" fill="#D97706"/>
      <circle cx="32" cy="42" r="4.5" fill="#451A03"/>
      <rect x="27" y="53" width="10" height="3" rx="1" fill="#451A03"/>
      <path d="M30.5 2 V54 M32 2 V54 M33.5 2 V54" stroke="#FEF3C7" stroke-width="0.6"/>
    </g>` },

  { file: "rumpa", keys: ["rumpa|pelotas, canicas"], body: `
    ${shadow(32, 56, 26)}
    ${[[18, 42, "#3B82F6"], [42, 44, "#EF4444"], [30, 26, "#22C55E"]].map(([x, y, c]) => `
    <circle cx="${x}" cy="${y}" r="11" fill="${c}"/>
    <path d="M${x - 8} ${y + 2} C${x - 3} ${y - 6} ${x + 3} ${y + 6} ${x + 9} ${y - 2}" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.65"/>
    <circle cx="${x - 4}" cy="${y - 5}" r="2.6" fill="#fff" opacity="0.8"/>`).join("")}` },

  { file: "tiyarina", keys: ["tiyarina|silla, silleta"], body: `
    ${shadow(32, 60, 20)}
    <rect x="17" y="34" width="4" height="25" rx="1.5" fill="#78350F"/>
    <rect x="43" y="34" width="4" height="25" rx="1.5" fill="#78350F"/>
    <rect x="23" y="38" width="3.5" height="17" rx="1.5" fill="#92400E"/>
    <rect x="38" y="38" width="3.5" height="17" rx="1.5" fill="#92400E"/>
    <rect x="18" y="6" width="28" height="24" rx="5" fill="#B45309"/>
    <rect x="23" y="11" width="18" height="14" rx="3" fill="#D97706"/>
    <rect x="21" y="28" width="4" height="8" fill="#92400E"/><rect x="39" y="28" width="4" height="8" fill="#92400E"/>
    <path d="M16 34 H48 L44 40 H20z" fill="#D97706"/>
    <path d="M16 34 H48" stroke="#92400E" stroke-width="2" stroke-linecap="round"/>` },

  { file: "taki", keys: ["taki|musica", "tunu|musica"], body: `
    <path d="M22 46 V14 L50 8 V40" stroke="#7C3AED" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <path d="M22 14 L50 8 V16 L22 22z" fill="#7C3AED"/>
    <ellipse cx="16" cy="47" rx="8" ry="6" fill="#7C3AED" transform="rotate(-20 16 47)"/>
    <ellipse cx="44" cy="41" rx="8" ry="6" fill="#7C3AED" transform="rotate(-20 44 41)"/>` },

  { file: "wawa", keys: ["wawa|niño, niña"], body: `
    <circle cx="13" cy="33" r="4.5" fill="${C.skin}"/><circle cx="51" cy="33" r="4.5" fill="${C.skin}"/>
    <circle cx="32" cy="34" r="20" fill="#F2C49B"/>
    <path d="M30 14 c-4 -6 4 -10 7 -5 c1 2 -1 4 -3 3" stroke="#78350F" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="25" cy="34" r="2.6" fill="${C.ink}"/><circle cx="39" cy="34" r="2.6" fill="${C.ink}"/>
    <circle cx="21" cy="41" r="3.5" fill="${C.pinkLight}" opacity="0.8"/><circle cx="43" cy="41" r="3.5" fill="${C.pinkLight}" opacity="0.8"/>
    <path d="M28 43 q4 4 8 0" stroke="${C.skinDark}" stroke-width="2" fill="none" stroke-linecap="round"/>` },

  { file: "pacha", keys: ["pacha|hora"], body: `
    ${shadow(32, 60, 16)}
    <circle cx="32" cy="32" r="25" fill="#F8FAFC" stroke="${C.waterDark}" stroke-width="4"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; const r1 = i % 3 ? 19 : 17; return `<path d="M${(32 + Math.sin(a) * r1).toFixed(1)} ${(32 - Math.cos(a) * r1).toFixed(1)} L${(32 + Math.sin(a) * 21).toFixed(1)} ${(32 - Math.cos(a) * 21).toFixed(1)}" stroke="${C.stoneDark}" stroke-width="${i % 3 ? 1.5 : 2.5}" stroke-linecap="round"/>`; }).join("")}
    <path d="M32 32 V18 M32 32 L42 37" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="2.5" fill="${C.red}"/>` },
];
