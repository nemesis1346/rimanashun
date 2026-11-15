// Body parts.
import { C, eye, shadow } from "../palette.mjs";

export const body = [
  { file: "maki", keys: ["maki|manos"], body: `
    <rect x="25" y="48" width="15" height="13" rx="3" fill="${C.skinDark}"/>
    <g fill="${C.skin}">
      <rect x="19" y="13" width="6" height="24" rx="3"/>
      <rect x="25.6" y="7" width="6" height="28" rx="3"/>
      <rect x="32.2" y="8" width="6" height="27" rx="3"/>
      <rect x="38.8" y="14" width="5.6" height="22" rx="2.8"/>
      <rect x="19" y="27" width="25.4" height="27" rx="10"/>
      <rect x="6" y="34.5" width="18" height="7" rx="3.5" transform="rotate(45 22 38)"/>
    </g>
    <path d="M25 33 v9" stroke="${C.skinDark}" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>` },

  { file: "chaki", keys: ["chaki|pie"], body: `
    <g fill="${C.skin}">
      <path d="M31 22 C41 22 45 30 43 40 C41 50 41 58 33 58 C25 58 23 50 23 42 C23 32 23 22 31 22z"/>
      <ellipse cx="38" cy="14" rx="5" ry="6"/>
      <ellipse cx="30" cy="11.5" rx="3.4" ry="4"/>
      <ellipse cx="23.8" cy="13.5" rx="3" ry="3.6"/>
      <ellipse cx="19.2" cy="17.8" rx="2.6" ry="3.1"/>
      <ellipse cx="16.6" cy="23" rx="2.2" ry="2.7"/>
    </g>
    <path d="M26 33 C24 40 25 46 27 51" stroke="${C.skinDark}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` },

  { file: "uma", keys: ["uma|cabeza"], body: `
    <path d="M10 64 C10 54 20 51 32 51 C44 51 54 54 54 64z" fill="${C.waterDark}"/>
    <rect x="26" y="44" width="12" height="10" fill="${C.skinDark}"/>
    <circle cx="15" cy="32" r="4" fill="${C.skin}"/><circle cx="49" cy="32" r="4" fill="${C.skin}"/>
    <ellipse cx="32" cy="30" rx="17" ry="19" fill="${C.skin}"/>
    <path d="M15 28 C14 14 22 9 32 9 C42 9 50 14 49 28 C44 20 38 18 32 18 C26 18 20 20 15 28z" fill="#1F2937"/>
    <circle cx="26" cy="31" r="2.1" fill="${C.ink}"/><circle cx="38" cy="31" r="2.1" fill="${C.ink}"/>
    <path d="M27 39 q5 4 10 0" stroke="${C.skinDark}" stroke-width="2" fill="none" stroke-linecap="round"/>` },

  { file: "rinri", keys: ["rinri|oreja"], body: `
    <path d="M24 10 C38 4 51 15 49 30 C48 38 41 40 39 46 C37 55 30 59 23 55 C19 52 21 46 19 42 C14 33 13 17 24 10z" fill="${C.skin}"/>
    <path d="M27 19 C36 15 43 22 41 30 C40 35 35 36 34 41" stroke="${C.skinDark}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M29 28 q5 -1 5 4" stroke="${C.skinDark}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` },

  { file: "ruka", keys: ["ruka|dedo"], body: `
    <rect x="22" y="50" width="20" height="11" rx="3" fill="${C.skinDark}"/>
    <g fill="${C.skin}">
      <rect x="18" y="5" width="9.5" height="32" rx="4.75"/>
      <rect x="18" y="29" width="28" height="23" rx="9"/>
    </g>
    <rect x="20.5" y="7" width="4.5" height="6" rx="2" fill="#F5D0B5"/>
    <path d="M28 36 h16 M28 42.5 h16" stroke="${C.skinDark}" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
    <rect x="25" y="44" width="17" height="7" rx="3.5" fill="#DDA27A"/>` },

  { file: "shunku", keys: ["shunku|corazon"], body: `
    ${shadow(32, 60, 14)}
    <path d="M32 55 C14 43 6 33 6 22 C6 13 13 7 21 7 C26 7 30 10 32 14 C34 10 38 7 43 7 C51 7 58 13 58 22 C58 33 50 43 32 55z" fill="#EF4444"/>
    <path d="M32 55 C50 43 58 33 58 22 C58 16 55 11 50 9 C54 14 54 22 50 30 C45 39 38 47 32 55z" fill="${C.red}"/>
    <ellipse cx="18" cy="19" rx="4" ry="6" fill="#FCA5A5" transform="rotate(-30 18 19)"/>` },

  { file: "rikra", keys: ["rikra|brazo"], body: `
    <rect x="3" y="34" width="9" height="22" rx="2" fill="${C.waterDark}"/>
    <g fill="${C.skin}">
      <path d="M10 44 C10 36 16 34 25 34 L40 36 C47 37 51 41 51 47 C51 53 45 55 39 55 H12 C10 55 10 50 10 44z"/>
      <path d="M17 37 C19 25 33 23 37 35z"/>
      <rect x="40" y="13" width="12" height="34" rx="6" transform="rotate(8 46 30)"/>
      <circle cx="48" cy="13" r="8.5"/>
    </g>
    <path d="M22 31 q6 -5 12 1" stroke="${C.skinDark}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M44 11 h7 M44 15 h7" stroke="${C.skinDark}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>` },
];
