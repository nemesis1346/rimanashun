// Nature: landscape, weather, plants.
import { C, eye, shadow } from "../palette.mjs";

// Six arms with two side branches each, for the snowflake.
const flake = [0, 60, 120, 180, 240, 300]
  .map((a) => `<g transform="rotate(${a} 32 32)"><path d="M32 32 V8 M32 15 l-6 -5 M32 15 l6 -5 M32 23 l-5 -4 M32 23 l5 -4"/></g>`)
  .join("");

export const nature = [
  { file: "yaku", keys: ["yaku|agua"], body: `
    ${shadow(32, 60, 14)}
    <path d="M32 6 C32 6 13 29 13 40 a19 19 0 0 0 38 0 C51 29 32 6 32 6z" fill="${C.water}"/>
    <path d="M32 59 a19 19 0 0 0 19-19 c0-5-4-12-9-19 c3 7 5 13 5 18 a17 17 0 0 1-15 20z" fill="${C.waterDark}"/>
    <ellipse cx="24" cy="40" rx="3.5" ry="7" fill="${C.waterLight}" transform="rotate(-18 24 40)"/>` },

  { file: "urku", keys: ["urku|montaña, monte"], body: `
    <path d="M38 18 L60 54 H16z" fill="${C.stone}"/>
    <path d="M38 18 L44 27.8 L40.5 26 L38 29 L35.5 26 L32 27.8z" fill="${C.snow}"/>
    <path d="M24 12 L46 54 H2z" fill="${C.stoneDark}"/>
    <path d="M24 12 L30.8 25 L27 23 L24 26.5 L21 23 L17.2 25z" fill="${C.snow}"/>
    <rect x="2" y="52" width="60" height="6" rx="3" fill="${C.leaf}"/>` },

  { file: "kucha", keys: ["kucha|laguna, lago"], body: `
    <path d="M6 36 L20 18 L34 36z" fill="${C.stone}"/>
    <path d="M20 18 L24 23 L20 22 L16 23z" fill="${C.snow}"/>
    <path d="M24 36 L40 12 L56 36z" fill="${C.stoneDark}"/>
    <path d="M40 12 L44.7 19 L40 17.5 L35.3 19z" fill="${C.snow}"/>
    <ellipse cx="32" cy="45" rx="29" ry="14" fill="${C.grass}"/>
    <ellipse cx="32" cy="46" rx="22" ry="9" fill="${C.waterDark}"/>
    <path d="M19 44 h9 M35 49 h10" stroke="${C.waterLight}" stroke-width="2" stroke-linecap="round"/>
    <path d="M9 48 v-9 M12.5 49 v-12 M53 47 v-10 M56 48 v-7" stroke="${C.leafDark}" stroke-width="2.2" stroke-linecap="round"/>` },

  { file: "allpa", keys: ["allpa|tierra", "allpa|tierra, terreno"], body: `
    <path d="M3 56 C7 38 21 30 32 30 C43 30 57 38 61 56z" fill="#92400E"/>
    <path d="M3 56 C10 48 22 45 32 45 C42 45 54 48 61 56z" fill="${C.brownDark}"/>
    <g fill="#B45309"><circle cx="22" cy="40" r="2"/><circle cx="36" cy="37" r="1.6"/><circle cx="44" cy="44" r="2.2"/><circle cx="16" cy="49" r="1.5"/><circle cx="30" cy="51" r="1.8"/><circle cx="49" cy="52" r="1.5"/></g>
    <ellipse cx="40" cy="33" rx="3.5" ry="2.4" fill="${C.stone}"/>` },

  { file: "hawa-pacha", keys: ["hawa pacha|cielo"], body: `
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#BAE6FD"/>
    <circle cx="44" cy="20" r="8" fill="#FACC15"/>
    <g fill="#fff"><circle cx="20" cy="40" r="7"/><circle cx="29" cy="35" r="9"/><circle cx="38" cy="41" r="6"/><rect x="13" y="40" width="31" height="7" rx="3.5"/></g>
    <path d="M44 34 q2 -2 4 0 q2 -2 4 0 M14 18 q2 -2 4 0 q2 -2 4 0" stroke="${C.stoneDark}" stroke-width="1.5" fill="none" stroke-linecap="round"/>` },

  { file: "kiwu", keys: ["kiwu|hierba"], body: `
    ${shadow(32, 58, 22)}
    <path d="M12 58 C13 44 11 34 6 26 C15 32 19 44 19 58z" fill="${C.leafDark}"/>
    <path d="M18 58 C19 40 18 26 14 12 C23 24 26 42 25 58z" fill="${C.leaf}"/>
    <path d="M24 58 C26 42 30 30 34 18 C36 32 33 46 32 58z" fill="#4ADE80"/>
    <path d="M31 58 C32 40 36 24 44 10 C43 28 39 44 39 58z" fill="${C.leaf}"/>
    <path d="M38 58 C40 46 46 36 56 30 C50 40 46 50 46 58z" fill="${C.leafDark}"/>
    <path d="M45 58 C47 48 52 42 58 40 C55 46 52 52 52 58z" fill="#4ADE80"/>` },

  { file: "mayu", keys: ["mayu|rio"], body: `
    <rect x="4" y="4" width="56" height="56" rx="14" fill="${C.grass}"/>
    <path d="M22 4 C18 16 40 22 33 34 C26 46 34 52 36 60 H48 C46 50 40 44 46 33 C53 19 32 15 35 4z" fill="${C.waterDark}"/>
    <path d="M27 9 q3 4 1 8 M38 28 q-3 5 -2 9 M40 47 q2 4 2 8" stroke="${C.waterLight}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <g fill="${C.leafDark}"><circle cx="12" cy="44" r="4"/><circle cx="16" cy="48" r="3"/><circle cx="52" cy="16" r="4"/></g>` },

  { file: "pukru", keys: ["pukru|loma"], body: `
    <path d="M18 58 C24 30 48 26 62 40 V58z" fill="${C.leafDark}"/>
    <path d="M2 58 C6 34 28 28 46 58z" fill="#4ADE80"/>
    <path d="M10 46 q6 -4 12 -1 M24 40 q5 -2 9 1" stroke="${C.leafDark}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>
    <path d="M50 34 v-6" stroke="${C.brownDark}" stroke-width="2"/><circle cx="50" cy="26" r="4.5" fill="${C.leaf}"/>` },

  { file: "puyu", keys: ["puyu|nube"], body: `
    <g fill="${C.outline}"><circle cx="18" cy="36" r="11.5"/><circle cx="32" cy="27" r="14.5"/><circle cx="46" cy="35" r="11.5"/><rect x="8" y="34" width="48" height="15.5" rx="7.7"/></g>
    <g fill="#F8FAFC"><circle cx="18" cy="36" r="10"/><circle cx="32" cy="27" r="13"/><circle cx="46" cy="35" r="10"/><rect x="9.5" y="35.5" width="45" height="12.5" rx="6.2"/></g>
    <path d="M14 44 H50" stroke="${C.shadow}" stroke-width="3" stroke-linecap="round"/>` },

  { file: "rasu", keys: ["rasu|nieve"], body: `
    <g stroke="${C.waterDark}" stroke-width="3.2" stroke-linecap="round" fill="none">${flake}</g>
    <circle cx="32" cy="32" r="3.5" fill="${C.waterDark}"/>` },

  { file: "rumi", keys: ["rumi|piedra"], body: `
    ${shadow(32, 56, 24)}
    <path d="M8 50 C5 40 12 30 22 26 C30 17 44 19 50 27 C58 31 61 43 56 51 C48 56 17 56 8 50z" fill="${C.stone}"/>
    <path d="M56 51 C61 43 58 31 50 27 C52 35 50 44 42 50 C34 54 20 54 8 50 C17 56 48 56 56 51z" fill="${C.stoneDark}"/>
    <path d="M22 26 L30 38 L44 34 M30 38 L28 50" stroke="${C.stoneDark}" stroke-width="1.8" fill="none" stroke-linejoin="round" opacity="0.7"/>
    <ellipse cx="22" cy="34" rx="4" ry="2.5" fill="#CBD5E1" transform="rotate(-30 22 34)"/>` },

  { file: "sisa", keys: ["sisa|flor"], body: `
    <path d="M32 30 V60" stroke="${C.leafDark}" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 50 C24 50 18 44 18 38 C26 38 32 44 32 50z" fill="${C.leaf}"/>
    <path d="M32 46 C40 46 46 40 46 34 C38 34 32 40 32 46z" fill="${C.leaf}"/>
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="32" cy="12" rx="7" ry="9" fill="#EC4899" transform="rotate(${a} 32 22)"/>`).join("")}
    <circle cx="32" cy="22" r="6" fill="#FACC15"/>
    <circle cx="30" cy="20" r="1.6" fill="#FEF9C3"/>` },

  { file: "wayra", keys: ["wayra|viento"], body: `
    <g stroke="${C.water}" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M6 22 H36 a7 7 0 1 0 -7 -7"/>
      <path d="M6 34 H48 a7 7 0 1 1 -7 7"/>
      <path d="M12 46 H28 a5 5 0 1 1 -5 5"/>
    </g>` },

  { file: "yura", keys: ["yura|planta o matorral"], body: `
    ${shadow(32, 58, 22)}
    <path d="M30 58 V44 M30 50 l-6 -6 M30 48 l7 -7" stroke="${C.brownDark}" stroke-width="3" stroke-linecap="round"/>
    <g fill="${C.leafDark}"><circle cx="18" cy="38" r="10"/><circle cx="46" cy="38" r="10"/></g>
    <g fill="${C.leaf}"><circle cx="24" cy="28" r="12"/><circle cx="40" cy="28" r="12"/><circle cx="32" cy="38" r="11"/><circle cx="32" cy="20" r="10"/></g>
    <g fill="#4ADE80"><circle cx="26" cy="22" r="3"/><circle cx="38" cy="30" r="2.5"/><circle cx="22" cy="34" r="2"/></g>` },

  { file: "sapi", keys: ["sapi|raiz"], body: `
    <rect x="4" y="28" width="56" height="32" rx="10" fill="#92400E"/>
    <rect x="4" y="28" width="56" height="6" fill="${C.brownDark}"/>
    <path d="M32 30 V8" stroke="${C.leafDark}" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 18 C24 17 20 11 22 6 C29 8 32 12 32 18z M32 14 C40 13 44 8 42 3 C35 5 32 9 32 14z" fill="${C.leaf}"/>
    <g stroke="${C.crumb}" stroke-width="2.4" fill="none" stroke-linecap="round">
      <path d="M32 31 V50 M32 38 C26 42 20 42 16 48 M32 36 C38 40 44 40 48 47 M32 44 C28 48 26 52 24 56 M32 46 C36 50 38 53 40 56 M20 45 l-4 -1 M44 43 l4 -1"/>
    </g>` },

  { file: "sara-chakra", keys: ["sara chakra|sementeria maiz"], body: `
    <rect x="2" y="54" width="60" height="6" rx="3" fill="#92400E"/>
    ${[14, 32, 50].map((x, i) => `
    <path d="M${x} 56 V${12 + i % 2 * 4}" stroke="${C.leafDark}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M${x} 40 C${x - 8} 36 ${x - 11} 30 ${x - 12} 24 M${x} 32 C${x + 8} 28 ${x + 10} 22 ${x + 11} 16 M${x} 48 C${x + 7} 46 ${x + 10} 42 ${x + 11} 38" stroke="${C.leaf}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M${x - 1} ${10 + i % 2 * 4} l-3 -5 M${x + 1} ${10 + i % 2 * 4} l3 -5 M${x} ${10 + i % 2 * 4} v-6" stroke="#CA8A04" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="${x + 4}" cy="38" rx="3.2" ry="7" fill="#FACC15" transform="rotate(20 ${x + 4} 38)"/>
    <path d="M${x} 44 C${x + 2} 40 ${x + 5} 34 ${x + 7} 32" stroke="${C.leaf}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join("")}` },

  { file: "pakcha", keys: ["pakcha|cascada"], body: `
    <path d="M4 10 H24 V60 H4z" fill="${C.stoneDark}"/>
    <path d="M40 10 H60 V60 H40z" fill="${C.stoneDark}"/>
    <path d="M4 10 H60 V16 H4z" fill="${C.leafDark}"/>
    <rect x="22" y="14" width="20" height="38" fill="${C.water}"/>
    <path d="M26 18 V46 M32 16 V50 M38 18 V46" stroke="${C.waterLight}" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="32" cy="54" rx="22" ry="6" fill="${C.waterDark}"/>
    <g fill="#fff"><circle cx="24" cy="51" r="3"/><circle cx="30" cy="49" r="3.5"/><circle cx="37" cy="50" r="3"/><circle cx="42" cy="52" r="2.5"/></g>` },

  { file: "mallki", keys: ["mallki|rama"], body: `
    <path d="M6 54 C20 44 34 32 58 12" stroke="${C.brownDark}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M30 36 C32 28 34 24 40 20 M20 46 C18 40 18 34 20 30" stroke="${C.brownDark}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g fill="${C.leaf}">
      <ellipse cx="42" cy="17" rx="7" ry="4" transform="rotate(-40 42 17)"/>
      <ellipse cx="20" cy="27" rx="4" ry="7" transform="rotate(-10 20 27)"/>
      <ellipse cx="50" cy="24" rx="7" ry="3.8" transform="rotate(20 50 24)"/>
      <ellipse cx="36" cy="38" rx="7" ry="3.8" transform="rotate(30 36 38)"/>
      <ellipse cx="12" cy="44" rx="6" ry="3.5" transform="rotate(-30 12 44)"/>
    </g>` },

  { file: "yanta", keys: ["yanta|leña"], body: `
    ${shadow(32, 58, 24)}
    ${[[18, 46], [32, 46], [46, 46], [25, 33], [39, 33], [32, 21]].map(([x, y]) => `
    <circle cx="${x}" cy="${y}" r="7.5" fill="#B45309"/>
    <circle cx="${x}" cy="${y}" r="5.5" fill="#F3D9A4"/>
    <circle cx="${x}" cy="${y}" r="3" fill="none" stroke="#C98A45" stroke-width="1.2"/>`).join("")}
    <path d="M8 40 C20 44 44 44 56 40" stroke="${C.red}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` },

  { file: "tamiana", keys: ["tamiana|llover"], body: `
    <g fill="${C.stone}"><circle cx="20" cy="24" r="9"/><circle cx="32" cy="18" r="12"/><circle cx="44" cy="24" r="9"/><rect x="11" y="23" width="42" height="11" rx="5.5"/></g>
    <g fill="${C.waterDark}">
      ${[[18, 42], [30, 46], [42, 42], [24, 54], [38, 56]].map(([x, y]) => `<path d="M${x} ${y - 5} c0 0 -3 4 -3 6 a3 3 0 0 0 6 0 c0-2 -3-6 -3-6z"/>`).join("")}
    </g>` },

  { file: "pura-killa", keys: ["pura killa|luna llena"], body: `
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#1E293B"/>
    <circle cx="32" cy="32" r="17" fill="#FEF3C7"/>
    <g fill="#FDE68A"><circle cx="26" cy="27" r="4"/><circle cx="38" cy="36" r="5"/><circle cx="29" cy="40" r="2.5"/><circle cx="39" cy="24" r="2"/></g>
    <g fill="#fff"><circle cx="12" cy="14" r="1.3"/><circle cx="52" cy="12" r="1"/><circle cx="50" cy="52" r="1.3"/><circle cx="13" cy="48" r="1"/></g>` },

  { file: "nan", keys: ["ñan|camino"], body: `
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#BAE6FD"/>
    <path d="M4 22 Q32 12 60 22 V46 a14 14 0 0 1 -14 14 H18 a14 14 0 0 1 -14 -14z" fill="${C.grass}"/>
    <path d="M29.5 17 H34.5 L46 60 H18z" fill="${C.stoneDark}"/>
    <path d="M32 22 V27 M32 33 V40 M32 47 V56" stroke="#FACC15" stroke-width="2.5" stroke-linecap="round"/>` },
];
