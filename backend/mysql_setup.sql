-- Run this in MySQL before starting Django
-- mysql -u root -p < mysql_setup.sql

CREATE DATABASE IF NOT EXISTS spare_parts_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'spare_user'@'localhost' IDENTIFIED BY 'spare_pass_123';
GRANT ALL PRIVILEGES ON spare_parts_db.* TO 'spare_user'@'localhost';
FLUSH PRIVILEGES;

SELECT 'Database spare_parts_db created successfully!' AS message;
