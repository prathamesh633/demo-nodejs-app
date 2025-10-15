-- runs automatically on first start
CREATE USER IF NOT EXISTS 'demo-user'@'%' IDENTIFIED WITH caching_sha2_password BY '${DB_PASSWORD}';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON ${DB_NAME}.* TO 'demo-user'@'%';
FLUSH PRIVILEGES;