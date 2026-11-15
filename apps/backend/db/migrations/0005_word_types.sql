-- Word type of a sense (noun, verb, adjective, ...). The quiz picks wrong
-- answers of the same type, so a noun is never offered next to a verb or a
-- whole sentence. Loaded by db/seed.js from
-- packages/shared/data/word-types.json; NULL if a word has no entry there.
ALTER TABLE words ADD COLUMN word_type TEXT CHECK (word_type IN (
  'noun', 'verb', 'verb_form', 'adjective', 'adverb', 'pronoun', 'question',
  'number', 'connector', 'interjection', 'phrase', 'unclear'
));
