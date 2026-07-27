-- Add persisted household budget settings to an existing database.
-- Usage:
--   mysql -u root -p luckywallet_dev < sql/004_add_household_settings.sql

CREATE TABLE IF NOT EXISTS household_settings (
  id INT NOT NULL,
  monthly_budget DECIMAL(10,2) NOT NULL DEFAULT 2400.00,
  PRIMARY KEY (id),
  CONSTRAINT ck_household_settings_budget_positive CHECK (monthly_budget > 0)
) ENGINE=InnoDB;
