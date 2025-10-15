-- runs automatically on first start
CREATE USER IF NOT EXISTS 'demo-user'@'%' IDENTIFIED WITH caching_sha2_password BY 'D3m0P@ss!';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON mydb.* TO 'demo-user'@'%';
FLUSH PRIVILEGES;