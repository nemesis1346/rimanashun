// Animals.
import { C, eye, shadow } from "../palette.mjs";

export const animals = [
  { file: "allku", keys: ["allku|perro"], body: `
    <path d="M15 17 C7 21 7 38 14 42 C19 37 21 26 21 19z" fill="${C.brownDark}"/>
    <path d="M49 17 C57 21 57 38 50 42 C45 37 43 26 43 19z" fill="${C.brownDark}"/>
    <ellipse cx="32" cy="31" rx="17" ry="18" fill="${C.brown}"/>
    <ellipse cx="32" cy="42" rx="10.5" ry="8.5" fill="${C.muzzle}"/>
    <path d="M30 46.5 h4 v3.5 a2 2 0 0 1-4 0z" fill="#F87171"/>
    <ellipse cx="32" cy="38" rx="4.2" ry="3" fill="${C.ink}"/>
    <path d="M32 41 v3 M28 45 q4 3 8 0" stroke="${C.ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${eye(25, 27)}${eye(39, 27)}` },

  { file: "misi", keys: ["misi|gato"], body: `
    <path d="M13 32 L15 7 L29 18z" fill="${C.stoneDark}"/>
    <path d="M51 32 L49 7 L35 18z" fill="${C.stoneDark}"/>
    <path d="M17 24 L18 13 L25 19z" fill="${C.pinkLight}"/>
    <path d="M47 24 L46 13 L39 19z" fill="${C.pinkLight}"/>
    <ellipse cx="32" cy="36" rx="19" ry="17" fill="${C.stone}"/>
    <ellipse cx="25" cy="33" rx="3.3" ry="4.2" fill="${C.leaf}"/><ellipse cx="25" cy="33" rx="1" ry="3.2" fill="${C.ink}"/>
    <ellipse cx="39" cy="33" rx="3.3" ry="4.2" fill="${C.leaf}"/><ellipse cx="39" cy="33" rx="1" ry="3.2" fill="${C.ink}"/>
    <path d="M30 41 h4 l-2 2.5z" fill="${C.pink}"/>
    <path d="M32 43.5 q-2 3 -5 1.5 M32 43.5 q2 3 5 1.5" stroke="${C.ink}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M21 42 h-11 M21 45 l-10 3.5 M43 42 h11 M43 45 l10 3.5" stroke="#475569" stroke-width="1.3" stroke-linecap="round"/>` },

  { file: "atallpa", keys: ["atallpa|gallina"], body: `
    <path d="M27 51 v8 M35 51 v8 M24 59 h6 M32 59 h6" stroke="${C.yellow}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M14 36 L4 21 L15 28 L11 15 L21 28z" fill="${C.brownDark}"/>
    <path d="M38 30 L43 21 L53 24 L47 37z" fill="#D97706"/>
    <ellipse cx="30" cy="39" rx="18" ry="14" fill="#D97706"/>
    <path d="M20 39 q9 -9 20 0 q-9 11 -20 0z" fill="${C.brown}"/>
    <circle cx="47" cy="22" r="8" fill="#D97706"/>
    <path d="M41 16 q1.5-7 4.5-1.5 q2-7 4.5-0.5 q3.5-4 2.5 2.5z" fill="${C.red}"/>
    <path d="M54 20.5 l7 2.5 l-7 2.5z" fill="${C.yellow}"/>
    <ellipse cx="52.5" cy="29" rx="2" ry="3" fill="${C.red}"/>
    <circle cx="49" cy="20.5" r="1.7" fill="${C.ink}"/>` },

  { file: "wakra", keys: ["wakra|toro"], body: `
    <path d="M19 20 C10 18 5 10 8 3 C12 10 16 12 23 14z" fill="#F5F5F4" stroke="#A8A29E" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M45 20 C54 18 59 10 56 3 C52 10 48 12 41 14z" fill="#F5F5F4" stroke="#A8A29E" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="13" cy="26" rx="7.5" ry="3.6" transform="rotate(-20 13 26)" fill="#57534E"/>
    <ellipse cx="51" cy="26" rx="7.5" ry="3.6" transform="rotate(20 51 26)" fill="#57534E"/>
    <path d="M20 14 H44 C48 14 50 18 50 24 C50 34 46 40 44 46 H20 C18 40 14 34 14 24 C14 18 16 14 20 14z" fill="#44403C"/>
    <path d="M27 14 q5 7 10 0z" fill="#292524"/>
    <rect x="19" y="39" width="26" height="17" rx="8.5" fill="#A8A29E"/>
    <ellipse cx="27" cy="48" rx="2.3" ry="2.8" fill="#44403C"/><ellipse cx="37" cy="48" rx="2.3" ry="2.8" fill="#44403C"/>
    <circle cx="24" cy="28" r="3.2" fill="#fff"/><circle cx="24.5" cy="28.5" r="1.7" fill="${C.ink}"/>
    <circle cx="40" cy="28" r="3.2" fill="#fff"/><circle cx="39.5" cy="28.5" r="1.7" fill="${C.ink}"/>` },

  { file: "chapa", keys: ["chapa|burro"], body: `
    <ellipse cx="21" cy="14" rx="5" ry="13" transform="rotate(-18 21 14)" fill="#78716C"/>
    <ellipse cx="21" cy="14" rx="2.2" ry="9" transform="rotate(-18 21 14)" fill="#D6D3D1"/>
    <ellipse cx="43" cy="14" rx="5" ry="13" transform="rotate(18 43 14)" fill="#78716C"/>
    <ellipse cx="43" cy="14" rx="2.2" ry="9" transform="rotate(18 43 14)" fill="#D6D3D1"/>
    <rect x="18" y="17" width="28" height="42" rx="14" fill="#A8A29E"/>
    <path d="M26 18 q6 -7 12 0 q-6 4 -12 0z" fill="#57534E"/>
    <ellipse cx="32" cy="48" rx="12.5" ry="10" fill="#E7E5E4"/>
    <ellipse cx="27" cy="49" rx="1.8" ry="2.5" fill="#57534E"/><ellipse cx="37" cy="49" rx="1.8" ry="2.5" fill="#57534E"/>
    ${eye(25, 31, 2.6)}${eye(39, 31, 2.6)}` },

  { file: "kuchi", keys: ["kuchi|chancho"], body: `
    <path d="M14 26 L12 8 L28 16z" fill="${C.pink}"/>
    <path d="M50 26 L52 8 L36 16z" fill="${C.pink}"/>
    <ellipse cx="32" cy="35" rx="20" ry="18" fill="${C.pinkLight}"/>
    <ellipse cx="32" cy="41" rx="9.5" ry="7" fill="${C.pink}"/>
    <ellipse cx="28.8" cy="41" rx="1.7" ry="2.6" fill="#9D174D"/><ellipse cx="35.2" cy="41" rx="1.7" ry="2.6" fill="#9D174D"/>
    ${eye(24, 29, 2.5)}${eye(40, 29, 2.5)}` },

  { file: "kulta", keys: ["kulta|pato"], body: `
    <path d="M4 52 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0" stroke="${C.water}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M12 38 L5 29 L16 33z" fill="${C.stone}"/>
    <path d="M10 39 C10 31 18 29 26 31 L40 33 C50 33 54 39 50 45 C46 50 36 50 24 50 C15 50 10 46 10 39z" fill="#E2E8F0"/>
    <path d="M42 33 C50 33 54 39 50 45 C47 48 44 49 41 49 C44 44 44 38 42 33z" fill="#92400E"/>
    <path d="M17 39 q10 -8 20 0 q-10 8 -20 0z" fill="${C.stone}"/>
    <rect x="40" y="24" width="7" height="12" rx="3" fill="${C.leafDark}"/>
    <rect x="39.5" y="31.5" width="8" height="2.4" rx="1.2" fill="#fff"/>
    <circle cx="45" cy="21" r="8" fill="${C.leafDark}"/>
    <path d="M51.5 19.5 q8 0 9 3 q-4 2.5 -9 1.5z" fill="${C.yellow}"/>
    <circle cx="47.5" cy="19" r="1.6" fill="${C.ink}"/>` },

  { file: "pishku", keys: ["pishku|pajaro"], body: `
    <path d="M4 50 H60" stroke="${C.brownDark}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="54" cy="45" rx="5" ry="2.5" fill="${C.leaf}" transform="rotate(-30 54 45)"/>
    <path d="M27 46 v4 M33 46 v4" stroke="${C.yellow}" stroke-width="2" stroke-linecap="round"/>
    <path d="M15 37 L4 29 L8 43z" fill="#1D4ED8"/>
    <ellipse cx="28" cy="36" rx="15" ry="12" fill="${C.waterDark}"/>
    <ellipse cx="32" cy="41" rx="9" ry="6" fill="${C.waterLight}"/>
    <path d="M16 34 q10 -8 20 0 q-10 7 -20 0z" fill="#1D4ED8"/>
    <circle cx="40" cy="24" r="9" fill="${C.waterDark}"/>
    <path d="M48 23 l6 2 l-6 2z" fill="${C.yellow}"/>
    ${eye(43, 22, 1.9)}` },

  { file: "ukucha", keys: ["ukucha|raton"], body: `
    <path d="M13 47 C2 47 3 34 11 36" stroke="${C.pinkLight}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M12 47 C12 35 21 29 31 29 C42 29 50 37 57 45 C50 48 40 48 31 48 H14z" fill="${C.stone}"/>
    <circle cx="38" cy="28" r="7.5" fill="${C.stone}"/>
    <circle cx="38" cy="28" r="4.3" fill="${C.pinkLight}"/>
    <circle cx="56.5" cy="44.5" r="2.2" fill="${C.pink}"/>
    <path d="M54 46 l7 3 M54 44 l8 -1" stroke="#475569" stroke-width="1" stroke-linecap="round"/>
    <path d="M24 48 v3 M40 48 v3" stroke="${C.pinkLight}" stroke-width="2.2" stroke-linecap="round"/>
    ${eye(47, 37, 1.9)}` },

  { file: "urpi", keys: ["urpi|tortola"], body: `
    <path d="M15 37 L4 33 L6 42 L15 41z" fill="${C.outline}" stroke="${C.stone}" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="30" cy="38" rx="16" ry="9" fill="#E2E8F0" stroke="${C.stone}" stroke-width="1.5"/>
    <circle cx="47" cy="33" r="6" fill="#E2E8F0" stroke="${C.stone}" stroke-width="1.5"/>
    <path d="M52.5 32.5 l5.5 1.5 l-5.5 1.8z" fill="${C.yellow}"/>
    <circle cx="48.5" cy="31.8" r="1.3" fill="${C.ink}"/>
    <path d="M24 35 C22 23 30 12 43 9 C38 17 38 26 36 35z" fill="${C.snow}" stroke="${C.stone}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M28 33 C28 26 32 20 37 17" stroke="${C.outline}" stroke-width="1.5" fill="none" stroke-linecap="round"/>` },

  { file: "wallinku", keys: ["wallinku|conejo"], body: `
    <rect x="17" y="3" width="10" height="30" rx="5" fill="#E7E5E4" stroke="#A8A29E" stroke-width="1.5" transform="rotate(-8 22 30)"/>
    <rect x="20" y="7" width="4" height="21" rx="2" fill="${C.pinkLight}" transform="rotate(-8 22 30)"/>
    <rect x="37" y="3" width="10" height="30" rx="5" fill="#E7E5E4" stroke="#A8A29E" stroke-width="1.5" transform="rotate(8 42 30)"/>
    <rect x="40" y="7" width="4" height="21" rx="2" fill="${C.pinkLight}" transform="rotate(8 42 30)"/>
    <ellipse cx="32" cy="42" rx="16.5" ry="15" fill="#E7E5E4" stroke="#A8A29E" stroke-width="1.5"/>
    <circle cx="21.5" cy="46" r="3" fill="${C.pinkLight}" opacity="0.7"/><circle cx="42.5" cy="46" r="3" fill="${C.pinkLight}" opacity="0.7"/>
    <path d="M30 44 h4 l-2 2.3z" fill="${C.pink}"/>
    <path d="M32 46.3 v2 M32 48.3 q-2.5 2 -4.5 0.5 M32 48.3 q2.5 2 4.5 0.5" stroke="${C.ink}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <rect x="30" y="49.5" width="4" height="4.2" rx="0.8" fill="#fff" stroke="#A8A29E" stroke-width="0.9"/>
    ${eye(26, 38, 2.5)}${eye(38, 38, 2.5)}` },
];
