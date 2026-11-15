// Food and drink.
import { C, eye, shadow } from "../palette.mjs";

export const food = [
  { file: "lulun", keys: ["lulun|huevo"], body: `
    ${shadow(32, 60, 15)}
    <path d="M32 5 C20 5 12 25 12 38 a20 20 0 0 0 40 0 C52 25 44 5 32 5z" fill="${C.cream}" stroke="${C.creamEdge}" stroke-width="2"/>
    <path d="M44 14 C49 21 51 30 51 38 a19 19 0 0 1-19 19 C42 52 46 40 44 14z" fill="${C.creamEdge}" opacity="0.6"/>
    <ellipse cx="24" cy="24" rx="3" ry="6" fill="#FFFFFF" transform="rotate(20 24 24)"/>` },

  { file: "tanta", keys: ["tanta|pan"], body: `
    ${shadow(32, 54, 24)}
    <path d="M8 46 C8 28 19 18 32 18 C45 18 56 28 56 46 a4 4 0 0 1-4 4 H12 a4 4 0 0 1-4-4z" fill="${C.crust}"/>
    <path d="M8 46 C8 44 9 42 10 41 C16 44 24 45 32 45 C40 45 48 44 54 41 C55 42 56 44 56 46 a4 4 0 0 1-4 4 H12 a4 4 0 0 1-4-4z" fill="${C.crustDark}"/>
    <path d="M20 27 l5 7 M30 24 l5 7 M40 27 l5 7" stroke="${C.crumb}" stroke-width="3" stroke-linecap="round"/>` },

  { file: "muti", keys: ["muti|mote"], body: `
    ${shadow(32, 60, 20)}
    <ellipse cx="32" cy="33" rx="25" ry="6" fill="#1D4ED8"/>
    <g fill="#FFFBEB" stroke="#E7D9A0" stroke-width="1.2">
      <circle cx="18" cy="31" r="4.5"/><circle cx="46" cy="31" r="4.5"/>
      <circle cx="24" cy="27" r="4.5"/><circle cx="32" cy="25" r="4.5"/><circle cx="40" cy="27" r="4.5"/>
      <circle cx="28" cy="20" r="4.5"/><circle cx="36" cy="20" r="4.5"/>
      <circle cx="21" cy="33" r="4.5"/><circle cx="29" cy="31" r="4.5"/><circle cx="37" cy="31" r="4.5"/><circle cx="44" cy="34" r="4.5"/>
    </g>
    <path d="M7 34 H57 C57 48 47 57 32 57 C17 57 7 48 7 34z" fill="${C.waterDark}"/>
    <path d="M14 43 l4 4 l4-4 l4 4 l4-4 l4 4 l4-4 l4 4 l4-4 l4 4" stroke="#BFDBFE" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>` },

  { file: "aycha", keys: ["aycha|carne"], body: `
    ${shadow(32, 58, 22)}
    <path d="M9 31 C9 18 26 11 41 15 C55 19 59 34 51 45 C43 55 21 55 13 47 C10 43 9 37 9 31z" fill="#FECACA"/>
    <path d="M14 31 C14 21 28 15 40 18 C51 22 53 34 47 42 C40 50 24 50 18 44 C15 40 14 36 14 31z" fill="${C.red}"/>
    <path d="M18 27 C26 33 33 22 47 31" stroke="#FCA5A5" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M22 42 C28 39 31 44 38 40" stroke="#FCA5A5" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M40 19 C46 21 50 26 50 31" stroke="#FEE2E2" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>` },

  { file: "challwa", keys: ["challwa|pescado"], body: `
    <path d="M13 32 L2 21 L5 32 L2 43z" fill="#2563EB"/>
    <path d="M24 21 q7 -9 15 -1z" fill="#2563EB"/>
    <path d="M26 43 q5 7 11 1z" fill="#2563EB"/>
    <ellipse cx="32" cy="32" rx="22" ry="13" fill="${C.water}"/>
    <path d="M13 34 C20 42 44 44 53 36 C44 40 22 40 13 34z" fill="${C.waterLight}"/>
    <path d="M42 23 q-4 9 0 18" stroke="#2563EB" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M54 33 h-3" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/>
    ${eye(47, 28, 2.4)}` },

  { file: "kachi", keys: ["kachi |sal"], body: `
    ${shadow(30, 60, 13)}
    <g transform="rotate(28 32 40)">
      <path d="M21 24 H43 L41 55 a3 3 0 0 1-3 3 H26 a3 3 0 0 1-3-3z" fill="#E0F2FE" stroke="${C.stone}" stroke-width="1.5"/>
      <path d="M21.9 36 H42.1 L41 55 a3 3 0 0 1-3 3 H26 a3 3 0 0 1-3-3z" fill="#FFFFFF"/>
      <path d="M25 27 v8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 24 C20 8 44 8 44 24z" fill="${C.stone}"/>
      <rect x="18" y="22" width="28" height="5" rx="2" fill="${C.stoneDark}"/>
      <circle cx="26" cy="17" r="1.6" fill="#475569"/><circle cx="32" cy="14" r="1.6" fill="#475569"/><circle cx="38" cy="17" r="1.6" fill="#475569"/>
    </g>
    <g fill="#fff" stroke="${C.stone}" stroke-width="0.9">
      <rect x="50" y="24" width="3" height="3" rx="0.6"/><rect x="56" y="30" width="3" height="3" rx="0.6"/><rect x="51" y="34" width="3" height="3" rx="0.6"/><rect x="57" y="41" width="3" height="3" rx="0.6"/>
    </g>` },

  { file: "putsuku-yaku", keys: ["putsuku yaku|cerveza"], body: `
    ${shadow(30, 60, 18)}
    <path d="M42 29 h5 a7 7 0 0 1 7 7 v6 a7 7 0 0 1-7 7 h-5" stroke="${C.outline}" stroke-width="5" fill="none"/>
    <rect x="13" y="21" width="30" height="37" rx="4" fill="${C.yellow}" stroke="${C.outline}" stroke-width="2"/>
    <rect x="18" y="27" width="4" height="25" rx="2" fill="#FCD34D"/>
    <circle cx="30" cy="40" r="1.4" fill="#FEF3C7"/><circle cx="34" cy="47" r="1.1" fill="#FEF3C7"/><circle cx="27" cy="50" r="1" fill="#FEF3C7"/>
    <g fill="#fff" stroke="${C.shadow}" stroke-width="1.5"><circle cx="17" cy="21" r="6"/><circle cx="26" cy="17" r="7"/><circle cx="35" cy="18" r="6.5"/><circle cx="41" cy="22" r="5"/></g>` },

  { file: "yaku-wira", keys: ["yaku wira|aceite"], body: `
    ${shadow(32, 60, 14)}
    <path d="M27 8 h10 v7 c0 4 8 6 8 14 v25 a4 4 0 0 1-4 4 H23 a4 4 0 0 1-4-4 V29 c0-8 8-10 8-14z" fill="#FDE047" stroke="#CA8A04" stroke-width="1.5"/>
    <path d="M23 30 v22" stroke="#FEF9C3" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="26" y="4" width="12" height="6" rx="2" fill="${C.leafDark}"/>
    <rect x="22" y="35" width="20" height="13" rx="2" fill="#fff" opacity="0.9"/>
    <path d="M32 37.5 c0 0 -3.5 4.5 -3.5 6.5 a3.5 3.5 0 0 0 7 0 c0-2 -3.5-6.5 -3.5-6.5z" fill="#EAB308"/>` },
];
