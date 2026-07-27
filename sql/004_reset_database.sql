-- Reset local development database. WARNING: deletes all data.
-- Run from this directory:
--   mysql -u root -p luckywallet_dev < 006_reset_database.sql

DROP DATABASE IF EXISTS luckywallet_dev;
SOURCE 001_init_luckywallet.sql;
SOURCE 002_seed_demo_users.sql;
SOURCE 003_seed_demo_bills.sql;
