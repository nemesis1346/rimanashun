# Vocabulary data issues

Problems found in `packages/shared/data/vocabulary.json` (the authoring
source for the `words` / `word_translations` tables). Most were spotted while
drawing quiz pictures (picture cards make a wrong gloss obvious), so they
matter more once image questions ship. **Nothing here has been changed yet.**
Each item needs a decision from someone who knows Otavalo Kichwa.

Indexes are positions in `vocabulary.json` (0-based) as of 2026-11-14.

## Wrong or doubtful glosses

| Kichwa | Index | Current gloss (category) | Problem | Likely fix |
|---|---|---|---|---|
| `wasi` | 600 | "casado" (family) | Almost certainly a typo for "casa" (house). Wrong category too. | Gloss "casa", category `house` |
| `llama` | 258 | "oveja" (animals) | Ecuadorian Kichwa uses *llama* for sheep, so this may be right, but confirm. The quiz picture is a sheep, not a llama; a llama picture would teach the wrong thing. | Confirm; maybe add a note/second sense for the animal llama |
| `ñawi` | 350 | "cara, faz" (body) | Can also mean "eye" (ojo). No word in the vocabulary is glossed "ojo" at all. | Decide which sense(s) to teach; probably add "ojo" as its own sense |
| `nina` | 353, 354 | "decir" (actions), listed twice | "Fuego" (fire) is missing, and it's a common, very picturable word. (The duplicate is collapsed by the seed, see below.) | Add the "fuego" sense, category `nature` |
| `kuytsa` | — | "cuy, cobayo" | *Kuytsa* usually means young woman / girl; guinea pig is *kuy*. Needs checking. | Confirm; likely add `kuy` = "cuy" |
| `casa comunal` | — | "casa comunal" | Spanish text in the `kichwa` field. | Replace with the Kichwa term, or remove |

More doubtful glosses spotted while listing the concrete categories (not yet
checked as carefully as the table above):

| Kichwa | Current gloss (category) | Question |
|---|---|---|
| `shimi` | "lengua" (body) | *Shimi* is usually mouth / language; `hallu` is also "lengua" (tongue). "Lengua" is ambiguous in Spanish (tongue vs language). |
| `tullu` | "flaco" (body) | *Tullu* is usually bone ("hueso"); "flaco" may be a second sense. |
| `uksha` | "pajaro" (animals) and "paja" (nature) | "Pájaro" looks like a slip for "paja" (straw). |
| `yana shina` | "negro" and "parecido al negro" (colors) | *Yana* alone is black; `yana shina` is "like black". |
| `awak kari` | "tejedora" (house) | *Kari* is male, so likely "tejedor". |
| `uma pachallina` | "tla para cubrirse la cabeza" | Typo: "tela". |

These were left out of the quiz pictures until resolved: `llama`, `kuytsa`,
`uksha`, `yana shina`.

Spanish words stored in the `kichwa` field (loanwords or placeholders; decide
whether they should be taught as Kichwa): `cebolla`, `culantro`, `jugo`,
`leche`, `camisa`, `capilla`, `telar`, `casa comunal`, `sarcillo`.

## Missing common words

Not in the vocabulary at all, but basic and picturable:

- `inti`: sol (sun)
- `sara`: maíz (corn). Only appears inside compounds (`sara chakra`, `sara panka`)
- `kuy`: cuy (guinea pig), see `kuytsa` above
- "ojo" (eye) and "fuego" (fire) as glosses, see `ñawi` and `nina` above

## Things to know before fixing these

Since 2026-11-15 the database is the source of truth and `vocabulary.json`
is its export (`npm run db:export`), so fixes go into the database (a
migration for now, the admin console later), then re-export. Indexes above
are positions in the old hand-written file; use the word ids in the current
`vocabulary.json` instead.

- Progress refers to words by id, so correcting a gloss no longer loses
  anyone's progress.
- A fixed gloss can break a picture key in
  `packages/shared/scripts/word-icons/icons/*.mjs` (`kichwa|spanish`); the
  icon build reports it, then update the key.
