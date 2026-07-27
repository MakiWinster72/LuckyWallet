-- LuckyWallet demo bills for local development
-- Creates exactly 100 bills dated from 2026-05-01 through 2026-07-27.
--
-- Prerequisites:
--   1. Run sql/001_init_luckywallet.sql.
--   2. Create active users named Maki, Landen, Lucky, Ula, and Anna.
--
-- Usage:
--   mysql -u root -p luckywallet_dev < sql/002_seed_demo_bills.sql
--
-- This script is idempotent. It only replaces rows marked with its own
-- [demo-seed-2026] note prefix and never deletes user-created bills.

SET NAMES utf8mb4;
SET time_zone = '+08:00';

USE luckywallet_dev;

DROP PROCEDURE IF EXISTS seed_luckywallet_demo_bills;

DELIMITER $$

CREATE PROCEDURE seed_luckywallet_demo_bills()
BEGIN
  DECLARE v_index INT DEFAULT 1;
  DECLARE v_user_count INT DEFAULT 0;
  DECLARE v_category_count INT DEFAULT 0;
  DECLARE v_payer_slot INT;
  DECLARE v_category_slot INT;
  DECLARE v_participant_count INT;
  DECLARE v_payer_id INT UNSIGNED;
  DECLARE v_category_id INT UNSIGNED;
  DECLARE v_bill_id INT UNSIGNED;
  DECLARE v_bill_date DATE;
  DECLARE v_amount DECIMAL(10,2);
  DECLARE v_total_cents INT;
  DECLARE v_base_share_cents INT;
  DECLARE v_remainder_cents INT;
  DECLARE v_title VARCHAR(100);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    DROP TEMPORARY TABLE IF EXISTS seed_users;
    DROP TEMPORARY TABLE IF EXISTS seed_categories;
    RESIGNAL;
  END;

  DROP TEMPORARY TABLE IF EXISTS seed_users;
  DROP TEMPORARY TABLE IF EXISTS seed_categories;

  CREATE TEMPORARY TABLE seed_users (
    slot INT NOT NULL PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL
  );

  CREATE TEMPORARY TABLE seed_categories (
    slot INT NOT NULL PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL
  );

  INSERT INTO seed_users (slot, user_id)
  SELECT required_users.slot, users.id
  FROM (
    SELECT 1 AS slot, 'makiwinster' AS username
    UNION ALL SELECT 2, 'landen'
    UNION ALL SELECT 3, 'lucky'
    UNION ALL SELECT 4, 'ula'
    UNION ALL SELECT 5, 'anna'
  ) AS required_users
  JOIN users
    ON LOWER(users.username) = required_users.username
   AND users.is_active = TRUE
  ORDER BY required_users.slot;

  INSERT INTO seed_categories (slot, category_id)
  SELECT ROW_NUMBER() OVER (ORDER BY sort_order, id), id
  FROM categories
  WHERE is_active = TRUE
  ORDER BY sort_order, id
  LIMIT 6;

  SELECT COUNT(*) INTO v_user_count FROM seed_users;
  SELECT COUNT(*) INTO v_category_count FROM seed_categories;

  IF v_user_count < 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Demo seed requires active users: MakiWinster, Landen, Lucky, Ula, Anna';
  END IF;

  IF v_category_count < 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Demo seed requires at least six active categories';
  END IF;

  START TRANSACTION;

  DELETE FROM bills
  WHERE note LIKE '[demo-seed-2026]%';

  WHILE v_index <= 100 DO
    SET v_payer_slot = MOD(v_index - 1, 5) + 1;
    SET v_category_slot = MOD(v_index - 1, 6) + 1;
    SET v_participant_count = MOD(v_index - 1, 4) + 2;
    SET v_bill_date = DATE_ADD('2026-05-01', INTERVAL MOD((v_index - 1) * 37, 88) DAY);
    SET v_amount = 18 + MOD(v_index * 43, 483) + MOD(v_index * 17, 100) / 100;
    SET v_total_cents = ROUND(v_amount * 100);
    SET v_base_share_cents = FLOOR(v_total_cents / v_participant_count);
    SET v_remainder_cents = MOD(v_total_cents, v_participant_count);

    SELECT user_id INTO v_payer_id
    FROM seed_users
    WHERE slot = v_payer_slot;

    SELECT category_id INTO v_category_id
    FROM seed_categories
    WHERE slot = v_category_slot;

    SET v_title = CONCAT(
      CASE v_category_slot
        WHEN 1 THEN '一起吃饭'
        WHEN 2 THEN '零食补给'
        WHEN 3 THEN '日用品采购'
        WHEN 4 THEN '周末聚会'
        WHEN 5 THEN '共同出行'
        ELSE '临时共同支出'
      END,
      ' · ',
      LPAD(v_index, 3, '0')
    );

    INSERT INTO bills (
      title,
      amount,
      payer_id,
      bill_date,
      category_id,
      note,
      created_by,
      created_at,
      updated_at
    )
    VALUES (
      v_title,
      v_amount,
      v_payer_id,
      v_bill_date,
      v_category_id,
      CONCAT('[demo-seed-2026] 自动生成的第 ', v_index, ' 笔模拟账单'),
      v_payer_id,
      TIMESTAMP(v_bill_date, MAKETIME(8 + MOD(v_index, 10), MOD(v_index * 7, 60), 0)),
      TIMESTAMP(v_bill_date, MAKETIME(8 + MOD(v_index, 10), MOD(v_index * 7, 60), 0))
    );

    SET v_bill_id = LAST_INSERT_ID();

    INSERT INTO bill_participants (bill_id, user_id, share_amount)
    SELECT
      v_bill_id,
      user_id,
      (
        v_base_share_cents
        + CASE WHEN slot <= v_remainder_cents THEN 1 ELSE 0 END
      ) / 100
    FROM seed_users
    WHERE slot <= v_participant_count
    ORDER BY slot;

    SET v_index = v_index + 1;
  END WHILE;

  COMMIT;

  DROP TEMPORARY TABLE seed_users;
  DROP TEMPORARY TABLE seed_categories;
END$$

DELIMITER ;

CALL seed_luckywallet_demo_bills();
DROP PROCEDURE seed_luckywallet_demo_bills;

-- Verification: expected result is 100 rows spanning 2026-05-01 to 2026-07-27.
SELECT
  COUNT(*) AS demo_bill_count,
  MIN(bill_date) AS first_bill_date,
  MAX(bill_date) AS last_bill_date,
  SUM(amount) AS demo_bill_total
FROM bills
WHERE note LIKE '[demo-seed-2026]%';

-- Every bill must be fully allocated to its participants.
SELECT COUNT(*) AS bills_with_invalid_shares
FROM (
  SELECT b.id
  FROM bills AS b
  JOIN bill_participants AS bp ON bp.bill_id = b.id
  WHERE b.note LIKE '[demo-seed-2026]%'
  GROUP BY b.id, b.amount
  HAVING SUM(bp.share_amount) <> b.amount
) AS invalid_shares;
