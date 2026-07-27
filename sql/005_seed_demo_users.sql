-- LuckyWallet 示例用户
-- 密码在备注中标注，登录后可修改
--
-- 依赖: 001_init_luckywallet.sql (users 表)

INSERT IGNORE INTO users (username, password_hash, nickname, role, is_active, created_at, updated_at)
VALUES
  -- 管理员
  ('MakiWinster',
   '$argon2id$v=19$m=65536,t=3,p=4$m1q10jLPt6q5JlslFLPgkw$/pjWlpP5VvpxceN60emyDPRMyxYNb7ijPawmIf7DjhA',
   'Maki', 'admin', TRUE, NOW(), NOW()),
  -- 普通成员
  ('Lucky',
   '$argon2id$v=19$m=65536,t=3,p=4$2c7Spq0NkB+nt6rBtbM/iQ$+PiBti1Rl90DNZDI7wt926WMZ940raT44UWPKcpvZ64',
   'Lucky', 'user', TRUE, NOW(), NOW()),
  ('Ula',
   '$argon2id$v=19$m=65536,t=3,p=4$JrDHqRXiGtp41tj9XU0wug$sR5ZKMJKfobUDwKLD+7bRamwgL/Fboa4DCL9rmfkLfI',
   'Ula', 'user', TRUE, NOW(), NOW()),
  ('Landen',
   '$argon2id$v=19$m=65536,t=3,p=4$AnElbhZZ/Hc19JHK+G3itQ$q64UAZAM1XO4he7SiTcbALPpMpc5vs+Buo6gQ1hibvs',
   'Landen', 'user', TRUE, NOW(), NOW()),
  ('Anna',
   '$argon2id$v=19$m=65536,t=3,p=4$eAAY4djP3qq5CMkHNFs2gA$ss0xVG8MeQPrFMoRlcTxfqOhzLsqcK6nIrCcVzaKzHA',
   'Anna', 'user', TRUE, NOW(), NOW());
