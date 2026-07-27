-- Add profile avatar support to an existing LuckyWallet database.
-- Usage:
--   mysql -u root -p luckywallet_dev < sql/003_add_user_avatar.sql

ALTER TABLE users
  ADD COLUMN avatar_url VARCHAR(255) NULL AFTER nickname;
