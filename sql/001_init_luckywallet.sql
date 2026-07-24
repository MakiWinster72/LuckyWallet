-- LuckyWallet MySQL 8.0 initial schema
-- Source of truth: myDocs/DATABASE.md
--
-- Usage:
--   mysql -u root -p < sql/001_init_luckywallet.sql
--
-- This script initializes the local development database. Production schema
-- changes should be executed through reviewed Alembic migrations.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS luckywallet_dev
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE luckywallet_dev;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50)
    CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uq_users_username UNIQUE (username),
  CONSTRAINT ck_users_role CHECK (role IN ('admin', 'user'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uq_categories_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bills (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payer_id INT UNSIGNED NOT NULL,
  bill_date DATE NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  note TEXT NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT ck_bills_amount_positive CHECK (amount > 0),
  CONSTRAINT fk_bills_payer
    FOREIGN KEY (payer_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_bills_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_bills_creator
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  INDEX ix_bills_payer_id (payer_id),
  INDEX ix_bills_category_id (category_id),
  INDEX ix_bills_created_by (created_by),
  INDEX ix_bills_bill_date_category (bill_date, category_id),
  INDEX ix_bills_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bill_participants (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  bill_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  share_amount DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uq_bill_participants_bill_user UNIQUE (bill_id, user_id),
  CONSTRAINT ck_bill_participants_share_nonnegative
    CHECK (share_amount >= 0),
  CONSTRAINT fk_bill_participants_bill
    FOREIGN KEY (bill_id) REFERENCES bills (id)
    ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT fk_bill_participants_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  INDEX ix_bill_participants_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NULL,
  resource_id INT UNSIGNED NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  detail JSON NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE SET NULL,
  INDEX ix_audit_logs_user_created (user_id, created_at),
  INDEX ix_audit_logs_action_created (action, created_at),
  INDEX ix_audit_logs_resource (resource_type, resource_id),
  INDEX ix_audit_logs_created_at (created_at)
) ENGINE=InnoDB;

INSERT INTO categories (name, icon, sort_order)
VALUES
  ('餐饮', 'restaurant', 10),
  ('零食', 'snack', 20),
  ('日用品', 'shopping-bag', 30),
  ('聚会', 'celebration', 40),
  ('交通', 'directions-car', 50),
  ('其他', 'category', 999)
ON DUPLICATE KEY UPDATE
  icon = VALUES(icon),
  sort_order = VALUES(sort_order);
