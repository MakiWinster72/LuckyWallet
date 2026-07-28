-- LuckyWallet 示例账单
-- 生成 2024-01-01 至 2026-07-29 期间的 300 笔账单。
-- 每月生成 9 或 10 笔，单笔金额为 80.00–160.00，每月总额不超过 2000.00。
-- 从 21 名成员中为每笔账单选择 3–10 名参与人，付款人按成员顺序轮换。
--
-- 依赖：001_init_luckywallet.sql、002_seed_demo_users.sql
-- 本脚本可重复执行，只删除自己生成的 [demo-seed-2026] 账单。

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
  DECLARE v_payer_id INT UNSIGNED;
  DECLARE v_category_id INT UNSIGNED;
  DECLARE v_bill_id INT UNSIGNED;
  DECLARE v_bill_date DATE;
  DECLARE v_amount DECIMAL(10,2);
  DECLARE v_total_cents INT;
  DECLARE v_base_share_cents INT;
  DECLARE v_remainder_cents INT;
  DECLARE v_participant_count INT;
  DECLARE v_title VARCHAR(100);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    DROP TEMPORARY TABLE IF EXISTS seed_users;
    DROP TEMPORARY TABLE IF EXISTS seed_categories;
    DROP TEMPORARY TABLE IF EXISTS seed_bill_users;
    RESIGNAL;
  END;

  DROP TEMPORARY TABLE IF EXISTS seed_users;
  DROP TEMPORARY TABLE IF EXISTS seed_categories;
  DROP TEMPORARY TABLE IF EXISTS seed_bill_users;

  CREATE TEMPORARY TABLE seed_users (
    slot INT NOT NULL PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL
  );

  CREATE TEMPORARY TABLE seed_categories (
    slot INT NOT NULL PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL
  );

  CREATE TEMPORARY TABLE seed_bill_users (
    slot INT NOT NULL PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL
  );

  INSERT INTO seed_users (slot, user_id)
  SELECT required_users.slot, users.id
  FROM (
    SELECT 1 AS slot, 'lucky' AS username
    UNION ALL SELECT 2, 'ula'
    UNION ALL SELECT 3, 'landen'
    UNION ALL SELECT 4, 'maki'
    UNION ALL SELECT 5, 'anna'
    UNION ALL SELECT 6, 'clamez'
    UNION ALL SELECT 7, 'roy'
    UNION ALL SELECT 8, 'jasper'
    UNION ALL SELECT 9, 'phoenix'
    UNION ALL SELECT 10, 'winnie'
    UNION ALL SELECT 11, 'damien'
    UNION ALL SELECT 12, 'vicky'
    UNION ALL SELECT 13, 'cheryl'
    UNION ALL SELECT 14, 'liam'
    UNION ALL SELECT 15, 'wiley'
    UNION ALL SELECT 16, 'bevin'
    UNION ALL SELECT 17, 'anthony'
    UNION ALL SELECT 18, 'kenton'
    UNION ALL SELECT 19, 'leclerc'
    UNION ALL SELECT 20, 'evander'
    UNION ALL SELECT 21, 'cara'
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

  IF v_user_count < 21 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Demo seed requires all 21 active users from 002_seed_demo_users.sql';
  END IF;

  IF v_category_count < 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Demo seed requires at least six active categories';
  END IF;

  START TRANSACTION;

  DELETE FROM bills
  WHERE note LIKE '[demo-seed-2026]%';

  WHILE v_index <= 300 DO
    SET v_payer_slot = MOD(v_index - 1, 21) + 1;
    SET v_category_slot = MOD(v_index - 1, 6) + 1;
    SET v_bill_date = DATE_ADD(
      DATE_ADD('2024-01-01', INTERVAL MOD(v_index - 1, 31) MONTH),
      INTERVAL MOD(v_index * 7, 29) DAY
    );
    SET v_amount = 80 + MOD(v_index * 37, 81);
    SET v_total_cents = ROUND(v_amount * 100);

    SELECT user_id INTO v_payer_id
    FROM seed_users
    WHERE slot = v_payer_slot;

    SELECT category_id INTO v_category_id
    FROM seed_categories
    WHERE slot = v_category_slot;

    TRUNCATE TABLE seed_bill_users;
    INSERT INTO seed_bill_users (slot, user_id)
    SELECT slot, user_id
    FROM seed_users
    WHERE slot = v_payer_slot
       OR MOD(slot * 17 + v_index * 13, 21) < 2 + MOD(v_index, 8)
    ORDER BY slot;

    SELECT COUNT(*) INTO v_participant_count FROM seed_bill_users;
    SET v_base_share_cents = FLOOR(v_total_cents / v_participant_count);
    SET v_remainder_cents = MOD(v_total_cents, v_participant_count);

    SET v_title = CONCAT(
      CASE v_category_slot
        WHEN 1 THEN '一起吃饭'
        WHEN 2 THEN '零食补给'
        WHEN 3 THEN '日用品采购'
        WHEN 4 THEN '周末聚会'
        WHEN 5 THEN '出行费用'
        ELSE '临时支出'
      END,
      ' · ',
      LPAD(v_index, 3, '0')
    );

    INSERT INTO bills (
      title, amount, payer_id, bill_date, category_id, note,
      created_by, created_at, updated_at
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
        + CASE WHEN ROW_NUMBER() OVER (ORDER BY slot) <= v_remainder_cents THEN 1 ELSE 0 END
      ) / 100
    FROM seed_bill_users
    ORDER BY slot;

    SET v_index = v_index + 1;
  END WHILE;

  COMMIT;

  DROP TEMPORARY TABLE seed_users;
  DROP TEMPORARY TABLE seed_categories;
  DROP TEMPORARY TABLE seed_bill_users;
END$$

DELIMITER ;

CALL seed_luckywallet_demo_bills();
DROP PROCEDURE seed_luckywallet_demo_bills;

-- 验证：应为 300 笔，日期范围不晚于 2026-07-29，分摊错误数为 0。
SELECT
  COUNT(*) AS demo_bill_count,
  MIN(bill_date) AS first_bill_date,
  MAX(bill_date) AS last_bill_date,
  SUM(amount) AS demo_bill_total
FROM bills
WHERE note LIKE '[demo-seed-2026]%';

SELECT COUNT(*) AS bills_with_invalid_shares
FROM (
  SELECT b.id
  FROM bills AS b
  JOIN bill_participants AS bp ON bp.bill_id = b.id
  WHERE b.note LIKE '[demo-seed-2026]%'
  GROUP BY b.id, b.amount
  HAVING SUM(bp.share_amount) <> b.amount
) AS invalid_shares;

-- 该查询应无返回行。
SELECT
  DATE_FORMAT(bill_date, '%Y-%m') AS bill_month,
  COUNT(*) AS bill_count,
  SUM(amount) AS monthly_total
FROM bills
WHERE note LIKE '[demo-seed-2026]%'
GROUP BY DATE_FORMAT(bill_date, '%Y-%m')
HAVING SUM(amount) > 2000
ORDER BY bill_month;
