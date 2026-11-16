-- Learned words are identified by words.id from now on, not by
-- "kichwa|spanish": a gloss can be corrected (admin console) without users
-- losing the word. words.id is stable since db/bootstrap.js only loads an
-- empty database (the old seed restarted the ids on every run).
--
-- Today "kichwa|spanish" matches exactly one word, so the rewrite is 1:1.
UPDATE user_progress p
SET item_id = w.id::text
FROM words w
JOIN word_translations es ON es.word_id = w.id AND es.language_code = 'es'
WHERE p.kind = 'learnedWords'
  AND p.item_id = w.kichwa || '|' || es.value;

-- Keys that matched no word (a gloss that already changed) can't be
-- recovered.
DELETE FROM user_progress
WHERE kind = 'learnedWords' AND item_id !~ '^[1-9][0-9]*$';
