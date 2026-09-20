-- ============================================================================
-- Migration 001 - user ownership, constraints and indexes
-- ============================================================================
-- WHY THIS FILE EXISTS
--   db.js bootstraps the schema with CREATE TABLE IF NOT EXISTS. That statement
--   does nothing to a table that already exists, so a database created before
--   user_id was added to the table definitions will still be missing the
--   column, the foreign keys and the unique indexes. Fresh databases get the
--   correct shape from db.js; existing ones need this file.
--
-- HOW TO RUN
--   Take a backup first:
--     mysqldump -u <user> -p <database> > backup_before_001.sql
--   Then run each STEP in order, reading the notes. Steps that can destroy or
--   reassign data are left commented out on purpose - decide first, then run.
--     mysql -u <user> -p <database> < backend/migrations/001_user_ownership.sql
--
--   MySQL (unlike MariaDB) has no ADD COLUMN IF NOT EXISTS, so re-running a
--   step that already applied returns "Duplicate column name" / "Duplicate key
--   name". That error is safe to ignore - it means the step was already done.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- STEP 0 - INSPECT. Run this first and read the output before changing anything.
-- ----------------------------------------------------------------------------
SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
FROM   INFORMATION_SCHEMA.COLUMNS
WHERE  TABLE_SCHEMA = DATABASE()
  AND  TABLE_NAME IN ('users', 'food_master', 'exercise_master', 'food_entries', 'exercise_entries')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

SELECT TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM   INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE  TABLE_SCHEMA = DATABASE()
  AND  TABLE_NAME IN ('food_master', 'exercise_master', 'food_entries', 'exercise_entries');


-- ----------------------------------------------------------------------------
-- STEP 1 - ADD user_id AS NULLABLE.
--          Nullable first so the statement cannot fail on existing rows.
--          Skip any statement whose column already exists (STEP 0 tells you).
-- ----------------------------------------------------------------------------
ALTER TABLE food_entries     ADD COLUMN user_id INT NULL AFTER id;
ALTER TABLE exercise_entries ADD COLUMN user_id INT NULL AFTER id;
ALTER TABLE food_master      ADD COLUMN user_id INT NULL AFTER id;
ALTER TABLE exercise_master  ADD COLUMN user_id INT NULL AFTER id;


-- ----------------------------------------------------------------------------
-- STEP 2 - BACKFILL entries from their master row.
--          An entry belongs to whoever owns the food/exercise it references.
--          This is lossless and safe to run repeatedly.
-- ----------------------------------------------------------------------------
UPDATE food_entries fe
JOIN   food_master fm ON fe.food_id = fm.id
SET    fe.user_id = fm.user_id
WHERE  fe.user_id IS NULL
  AND  fm.user_id IS NOT NULL;

UPDATE exercise_entries ee
JOIN   exercise_master em ON ee.exercise_id = em.id
SET    ee.user_id = em.user_id
WHERE  ee.user_id IS NULL
  AND  em.user_id IS NOT NULL;


-- ----------------------------------------------------------------------------
-- STEP 3 - FIND ORPHANS. Rows that still have no owner after STEP 2.
--          NOTHING is deleted automatically. Read the counts, then choose 3a or 3b.
-- ----------------------------------------------------------------------------
SELECT 'food_master'      AS table_name, COUNT(*) AS orphan_rows FROM food_master      WHERE user_id IS NULL
UNION ALL
SELECT 'exercise_master',  COUNT(*) FROM exercise_master  WHERE user_id IS NULL
UNION ALL
SELECT 'food_entries',     COUNT(*) FROM food_entries     WHERE user_id IS NULL
UNION ALL
SELECT 'exercise_entries', COUNT(*) FROM exercise_entries WHERE user_id IS NULL;

-- If every count is 0, go straight to STEP 4.
--
-- OPTION 3a - ASSIGN the legacy rows to one existing account. Replace <OWNER_ID>
--             with a real users.id. Use this when the data predates multi-user
--             support and belongs to a single person.
--
-- UPDATE food_master      SET user_id = <OWNER_ID> WHERE user_id IS NULL;
-- UPDATE exercise_master  SET user_id = <OWNER_ID> WHERE user_id IS NULL;
-- UPDATE food_entries     SET user_id = <OWNER_ID> WHERE user_id IS NULL;
-- UPDATE exercise_entries SET user_id = <OWNER_ID> WHERE user_id IS NULL;
--
-- OPTION 3b - DELETE the unattributable rows. DESTRUCTIVE. Only after a backup,
--             and only if you have confirmed the rows are genuinely disposable.
--             Children first so the foreign keys stay satisfiable.
--
-- DELETE FROM food_entries     WHERE user_id IS NULL;
-- DELETE FROM exercise_entries WHERE user_id IS NULL;
-- DELETE FROM food_master      WHERE user_id IS NULL;
-- DELETE FROM exercise_master  WHERE user_id IS NULL;


-- ----------------------------------------------------------------------------
-- STEP 4 - ENFORCE NOT NULL.
--          Only run once STEP 3 reports 0 orphans everywhere; otherwise MySQL
--          silently coerces the NULLs to 0 and creates fake ownership.
-- ----------------------------------------------------------------------------
ALTER TABLE food_master      MODIFY COLUMN user_id INT NOT NULL;
ALTER TABLE exercise_master  MODIFY COLUMN user_id INT NOT NULL;
ALTER TABLE food_entries     MODIFY COLUMN user_id INT NOT NULL;
ALTER TABLE exercise_entries MODIFY COLUMN user_id INT NOT NULL;


-- ----------------------------------------------------------------------------
-- STEP 5 - FOREIGN KEYS to users. ON DELETE CASCADE matches db.js, so removing
--          an account removes its data instead of leaving it ownerless.
--          Skip any that STEP 0 already listed.
-- ----------------------------------------------------------------------------
ALTER TABLE food_master
  ADD CONSTRAINT fk_food_master_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE exercise_master
  ADD CONSTRAINT fk_exercise_master_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE food_entries
  ADD CONSTRAINT fk_food_entries_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE exercise_entries
  ADD CONSTRAINT fk_exercise_entries_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


-- ----------------------------------------------------------------------------
-- STEP 6 - DUPLICATE NAMES per user. The API rejects duplicates, but without a
--          unique index two concurrent requests can still both insert.
--          Check for pre-existing duplicates BEFORE adding the index - the
--          ALTER fails if any exist.
-- ----------------------------------------------------------------------------
SELECT user_id, food_name, COUNT(*) AS copies
FROM   food_master
GROUP  BY user_id, food_name
HAVING copies > 1;

SELECT user_id, exercise_name, COUNT(*) AS copies
FROM   exercise_master
GROUP  BY user_id, exercise_name
HAVING copies > 1;

-- Resolve any rows the two queries above return (rename or delete them by id),
-- then add the constraints:
ALTER TABLE food_master
  ADD UNIQUE KEY uq_food_master_user_name (user_id, food_name);

ALTER TABLE exercise_master
  ADD UNIQUE KEY uq_exercise_master_user_name (user_id, exercise_name);


-- ----------------------------------------------------------------------------
-- STEP 7 - INDEXES for the per-user reads. Every query in the app filters by
--          user_id, and the report queries also range over created_at.
-- ----------------------------------------------------------------------------
ALTER TABLE food_entries     ADD INDEX idx_food_entries_user_created (user_id, created_at);
ALTER TABLE exercise_entries ADD INDEX idx_exercise_entries_user_created (user_id, created_at);


-- ----------------------------------------------------------------------------
-- STEP 8 - updated_at, to match the table definitions in db.js. Additive and
--          backfilled from created_at, so no existing behaviour changes.
-- ----------------------------------------------------------------------------
ALTER TABLE food_master
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE exercise_master
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE food_entries
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE exercise_entries
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;


-- ----------------------------------------------------------------------------
-- STEP 9 - VERIFY. Every count must be 0.
-- ----------------------------------------------------------------------------
SELECT 'food_entries without a matching user' AS check_name, COUNT(*) AS failures
FROM   food_entries fe LEFT JOIN users u ON fe.user_id = u.id WHERE u.id IS NULL
UNION ALL
SELECT 'exercise_entries without a matching user', COUNT(*)
FROM   exercise_entries ee LEFT JOIN users u ON ee.user_id = u.id WHERE u.id IS NULL
UNION ALL
SELECT 'food_entries whose food belongs to another user', COUNT(*)
FROM   food_entries fe JOIN food_master fm ON fe.food_id = fm.id WHERE fe.user_id <> fm.user_id
UNION ALL
SELECT 'exercise_entries whose exercise belongs to another user', COUNT(*)
FROM   exercise_entries ee JOIN exercise_master em ON ee.exercise_id = em.id WHERE ee.user_id <> em.user_id;
