-- LuckyWallet 示例用户
-- 密码在备注中标注，登录后可修改
--
-- 依赖: 001_init_luckywallet.sql (users 表)

INSERT IGNORE INTO users (username, password_hash, nickname, role, is_active, created_at, updated_at)
VALUES
  -- 管理员
  ('MakiWinster',
   '$argon2id$v=19$m=65536,t=3,p=4$SehKcSkIKjGFl73E1lprAw$GIXeyqLI1OCkDb/1ShZHEvc+WtDHH66FU0kkpD+csII',
   'Maki', 'admin', TRUE, NOW(), NOW()),
  -- 普通成员
  ('Lucky',
   '$argon2id$v=19$m=65536,t=3,p=4$2c7Spq0NkB+nt6rBtbM/iQ$+PiBti1Rl90DNZDI7wt926WMZ940raT44UWPKcpvZ64',
   'Lucky', 'user', TRUE, NOW(), NOW()),
  ('Ula',
   '$argon2id$v=19$m=65536,t=3,p=4$MEazRIxo/1jxv9Qj+PL0VQ$c9W8bxubs5ffX1TBEfFXfRv91+8sWvAOuLhQ6zs5YSA',
   'Ula', 'user', TRUE, NOW(), NOW()),
  ('Landen',
   '$argon2id$v=19$m=65536,t=3,p=4$AnElbhZZ/Hc19JHK+G3itQ$q64UAZAM1XO4he7SiTcbALPpMpc5vs+Buo6gQ1hibvs',
   'Landen', 'user', TRUE, NOW(), NOW()),
  ('Anna',
   '$argon2id$v=19$m=65536,t=3,p=4$jaCBBlMN8r9B0rqewq6kZg$dsr1ab/1ShD3isXyBKSkAYZM14ks7zQO0/aSjEQBZAQ',
   'Anna', 'user', TRUE, NOW(), NOW());
