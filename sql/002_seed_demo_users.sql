-- LuckyWallet 示例用户
-- 密码规则：用户名 + 12345678，登录后请及时修改密码。
-- 表格第一行的五名用户为管理员，其余用户为普通成员。
--
-- 依赖: 001_init_luckywallet.sql (users 表)

SET NAMES utf8mb4;
SET time_zone = '+08:00';

INSERT IGNORE INTO users (
  username, password_hash, nickname, role, is_active, created_at, updated_at
)
VALUES
  -- 管理员
  ('Lucky', '$argon2id$v=19$m=65536,t=3,p=4$2FYtcMqGJQtxtDPTYwBDdQ$W5tBcKmlhyx986yK64By1tGS4ozNO/bPjiURUTKwU7E', '陈幸儿', 'admin', TRUE, NOW(), NOW()),
  ('Ula', '$argon2id$v=19$m=65536,t=3,p=4$jtSUXN/G8DcvHoH6rAGTVQ$I89c3tn6q5GsmSw4iTOfC0YG5N3w98biW1+VqBmGKuY', '邹宇璇', 'admin', TRUE, NOW(), NOW()),
  ('Landen', '$argon2id$v=19$m=65536,t=3,p=4$urveLYkiMYvbnSokqcqR0Q$19VUbTxNVWTpl2QlEJ7coGV/X3mKR+RK+x+7Rpoux0o', '李德志', 'admin', TRUE, NOW(), NOW()),
  ('Maki', '$argon2id$v=19$m=65536,t=3,p=4$bRceq0/HdbYzvgJ/Omy7Zg$IZaW112GiTbNA4QXXn2GTo+oGQlN1x+NoDdH4ETY+Do', '王源智', 'admin', TRUE, NOW(), NOW()),
  ('Anna', '$argon2id$v=19$m=65536,t=3,p=4$piiHb/WpmriH7zXaHDBmeA$UBW+FOk4ZBR+QDrh4Aw1ViU0MbYrBBj8xiiykl8VkL0', '张家艳', 'admin', TRUE, NOW(), NOW()),
  ('Cara', '$argon2id$v=19$m=65536,t=3,p=4$adgcHIrZ7Go52Zc+ecX9Qg$MKuzBFqG4MsY/n4dXbfyBujbJFMP/5j7irgAr+xZBEA', 'Cara', 'user', TRUE, NOW(), NOW()),
  -- 普通成员
  ('Clamez', '$argon2id$v=19$m=65536,t=3,p=4$tTDrrFEDLF7Zw/cyaeWD1g$VSdbYSYDuBOm+wEUvzysLyVuAjsC71MRtm+Cb+ZxiIo', '谢应江', 'user', TRUE, NOW(), NOW()),
  ('Roy', '$argon2id$v=19$m=65536,t=3,p=4$/jTrcs94fkG84//8XoJogQ$RnJQEknsGziTNb0GCe7MK216yphK4Wg4dGvt1S37IxQ', '钟永尧', 'user', TRUE, NOW(), NOW()),
  ('Jasper', '$argon2id$v=19$m=65536,t=3,p=4$kjVqbzoh6gFbKzgYqGXFhQ$WpZmZGAwl7spJ5wefkRFlivkjcwIdEWGf5ysby76peI', '李文俊', 'user', TRUE, NOW(), NOW()),
  ('Phoenix', '$argon2id$v=19$m=65536,t=3,p=4$RXlFTmpFBwQjSNI5xHo4UQ$ho/9wZ3SuHxlabxX3Y1OmBJiBGDH2tT3rPiH5T6G/CQ', '钟紫尹', 'user', TRUE, NOW(), NOW()),
  ('Winnie', '$argon2id$v=19$m=65536,t=3,p=4$nm80ApPRPKaiTCTytswzKQ$XTT7ePWUsDpPm5me0yB1BPKsMru/xT7QBTLJSD96ymI', '陈泳仪', 'user', TRUE, NOW(), NOW()),
  ('Damien', '$argon2id$v=19$m=65536,t=3,p=4$gdTppSMh7CeQpZOHvX8aLQ$yBCZcCzWaB9UwDibKD60I9o61zdlGAPhfhcPDjzxDBc', '周明哲', 'user', TRUE, NOW(), NOW()),
  ('Vicky', '$argon2id$v=19$m=65536,t=3,p=4$2NCnZ9zkwtbPwzRiDUqOIQ$aVL6Jrg6BUxsT8CX5QwiWR0/M8PVMocYvk4bLTQpAX4', '陈倚淇', 'user', TRUE, NOW(), NOW()),
  ('Cheryl', '$argon2id$v=19$m=65536,t=3,p=4$z8OnDabGneSEWrAmtx2sjA$KFdJxAJHGxrlfgCT2mPqqGAdfYcWWHkHDY0qVqEGl2Y', '郭琴茹', 'user', TRUE, NOW(), NOW()),
  ('Liam', '$argon2id$v=19$m=65536,t=3,p=4$4mwlq1SEeZOnVSt6T8krZA$jJ68VxnpoqLfMkAdSezwBiBcsomD+GdBnATzd8NXHDg', '李宗谚', 'user', TRUE, NOW(), NOW()),
  ('Wiley', '$argon2id$v=19$m=65536,t=3,p=4$NdKNLseV2Fb0pDs1pHG+cw$BAj7T7W/bgwxhUHNN8K4oy7yKk8dX9MWg3000JFB4CE', '翁富彦', 'user', TRUE, NOW(), NOW()),
  ('Bevin', '$argon2id$v=19$m=65536,t=3,p=4$DxkSY2+gyxp7K4Schx/WPg$y7k8ovsTFxDupxzD3NmY49mS9TC3CLyL7M6D1HXfBnE', '叶彬彬', 'user', TRUE, NOW(), NOW()),
  ('Anthony', '$argon2id$v=19$m=65536,t=3,p=4$0rl/N5lemyr2QhkgfYj0Cw$BqAP/qARrOCoZf4DE7xCSSuvKWYrYiyP/XcYuS6bkf8', '潘翔宇', 'user', TRUE, NOW(), NOW()),
  ('Kenton', '$argon2id$v=19$m=65536,t=3,p=4$cFVivKCOjhmx9DFq/HmbHw$p9ZHu++BpobpkdsaZtriA4g0T7NMWZNnl1CsK0e1Lic', '黄启腾', 'user', TRUE, NOW(), NOW()),
  ('Leclerc', '$argon2id$v=19$m=65536,t=3,p=4$JFaM85qCFJlmVuWZsldVKg$TfvflN+J80w+JcafLIm7vHSXxEyFkT/Kcm69Mk9YzFY', '莫乐炎', 'user', TRUE, NOW(), NOW()),
  ('Evander', '$argon2id$v=19$m=65536,t=3,p=4$dxFYuAYLnG4p0sxeQ0x7hg$yClamlgKjaWAGhsrQ+NibPCLHxT+0aZLJKSjGRJJqwY', '蒋汶卓', 'user', TRUE, NOW(), NOW());
