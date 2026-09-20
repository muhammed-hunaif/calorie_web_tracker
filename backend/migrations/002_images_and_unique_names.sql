-- ============================================================================
-- Migration 002 - image_url columns and unique master names
-- ============================================================================
-- Run AFTER 001_user_ownership.sql. Back up first:
--   mysqldump -u <user> -p <database> > backup_before_002.sql
--
-- MySQL has no ADD COLUMN IF NOT EXISTS, so a step that already applied returns
-- "Duplicate column name" / "Duplicate key name". That error is safe to ignore.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- STEP 0 - INSPECT.
-- ----------------------------------------------------------------------------
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM   INFORMATION_SCHEMA.COLUMNS
WHERE  TABLE_SCHEMA = DATABASE()
  AND  TABLE_NAME IN ('food_master', 'exercise_master')
  AND  COLUMN_NAME = 'image_url';

SELECT TABLE_NAME, INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols,
       IF(NON_UNIQUE = 0, 'UNIQUE', 'non-unique') AS kind
FROM   INFORMATION_SCHEMA.STATISTICS
WHERE  TABLE_SCHEMA = DATABASE()
  AND  TABLE_NAME IN ('food_master', 'exercise_master')
GROUP  BY TABLE_NAME, INDEX_NAME, NON_UNIQUE;


-- ----------------------------------------------------------------------------
-- STEP 1 - image_url. Holds the ImageKit URL returned by POST /api/upload/image.
--          Nullable: an item without a picture is normal. Skip if STEP 0 already
--          listed the column.
-- ----------------------------------------------------------------------------
ALTER TABLE food_master     ADD COLUMN image_url VARCHAR(500) NULL AFTER food_state;
ALTER TABLE exercise_master ADD COLUMN image_url VARCHAR(500) NULL AFTER calories_burned;


-- ----------------------------------------------------------------------------
-- STEP 2 - DUPLICATE NAMES. The API returns 409 on duplicates, but without a
--          unique index two concurrent requests can still both insert.
--          Run these first - the ALTERs in STEP 3 fail if either returns rows.
-- ----------------------------------------------------------------------------
SELECT user_id, food_name, COUNT(*) AS copies, GROUP_CONCAT(id) AS ids
FROM   food_master
GROUP  BY user_id, food_name
HAVING copies > 1;

SELECT user_id, exercise_name, COUNT(*) AS copies, GROUP_CONCAT(id) AS ids
FROM   exercise_master
GROUP  BY user_id, exercise_name
HAVING copies > 1;

-- If either query returned rows, resolve them by id before STEP 3 - rename the
-- extras, or delete them. Deleting a master row cascades to its entries, so
-- prefer renaming unless you are certain the duplicates are disposable:
--
-- UPDATE food_master     SET food_name     = CONCAT(food_name, ' (2)')     WHERE id = <ID>;
-- UPDATE exercise_master SET exercise_name = CONCAT(exercise_name, ' (2)') WHERE id = <ID>;


-- ----------------------------------------------------------------------------
-- STEP 3 - UNIQUE constraints, one name per user. The default collation is
--          case-insensitive, so "Rice" and "rice" collide - matching the
--          LOWER() comparison the API already does.
-- ----------------------------------------------------------------------------
ALTER TABLE food_master
  ADD UNIQUE KEY uq_food_master_user_name (user_id, food_name);

ALTER TABLE exercise_master
  ADD UNIQUE KEY uq_exercise_master_user_name (user_id, exercise_name);


-- ----------------------------------------------------------------------------
-- STEP 4 - VERIFY. Both tables must show image_url, and both unique keys must
--          be listed as UNIQUE.
-- ----------------------------------------------------------------------------
SELECT TABLE_NAME, INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols,
       IF(NON_UNIQUE = 0, 'UNIQUE', 'non-unique') AS kind
FROM   INFORMATION_SCHEMA.STATISTICS
WHERE  TABLE_SCHEMA = DATABASE()
  AND  TABLE_NAME IN ('food_master', 'exercise_master')
  AND  INDEX_NAME IN ('uq_food_master_user_name', 'uq_exercise_master_user_name')
GROUP  BY TABLE_NAME, INDEX_NAME, NON_UNIQUE;
