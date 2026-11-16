// All quiz pictures, one entry per picture: { file, keys, body }.
// Drawn per category in ./icons/, sharing ./palette.mjs (style guide there).
//
// `keys` are the words this picture is for, as `kichwa|spanish` (resolved to
// word ids by build.mjs, so they must match vocabulary.json). Several keys can
// share a picture (e.g. two spellings). Words with a doubtful gloss are left
// out on purpose; see docs/vocabulary-data-issues.md.
import { animals } from "./icons/animals.mjs";
import { body } from "./icons/body.mjs";
import { food } from "./icons/food.mjs";
import { nature } from "./icons/nature.mjs";
import { objects } from "./icons/objects.mjs";
import { feelings } from "./icons/feelings.mjs";
import { swatches, numerals } from "./icons/generated.mjs";

export const icons = [
  ...nature,
  ...food,
  ...objects,
  ...body,
  ...animals,
  ...feelings,
  ...swatches,
  ...numerals,
];
