// Actions and states shown as faces.
import { C } from "../palette.mjs";

const face = (inner) => `
    <circle cx="32" cy="33" r="25" fill="#FCD34D"/>
    <path d="M32 58 a25 25 0 0 0 25-25 c0-8-4-15-9-20 c3 5 4 10 4 16 a24 24 0 0 1-20 29z" fill="#FBBF24"/>
    ${inner}`;

export const feelings = [
  { file: "pununa", keys: ["puñuna|dormir"], body: face(`
    <path d="M20 32 q5 4 10 0 M34 32 q5 4 10 0" stroke="${C.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="32" cy="45" rx="3.5" ry="2.5" fill="#B45309"/>
    <path d="M44 6 h8 l-8 8 h8 M53 18 h5 l-5 5 h5" stroke="${C.waterDark}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },

  { file: "wakana", keys: ["wakana|llorar"], body: face(`
    <path d="M20 30 q5 -4 10 0 M34 30 q5 -4 10 0" stroke="${C.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M24 47 q8 -7 16 0" stroke="${C.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M22 34 c0 0 -4 6 -4 9 a4 4 0 0 0 8 0 c0-3 -4-9 -4-9z M42 34 c0 0 -4 6 -4 9 a4 4 0 0 0 8 0 c0-3 -4-9 -4-9z" fill="${C.water}"/>`) },

  { file: "asina", keys: ["asina|reirse"], body: face(`
    <path d="M19 30 q5 -6 10 0 M35 30 q5 -6 10 0" stroke="${C.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M19 38 H45 C45 48 39 53 32 53 C25 53 19 48 19 38z" fill="#7F1D1D"/>
    <path d="M24 47 q8 -5 16 0 C38 51 35 53 32 53 C29 53 26 51 24 47z" fill="#F87171"/>
    <rect x="21" y="38" width="22" height="4" rx="1" fill="#fff"/>`) },
];
