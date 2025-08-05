ALTER TABLE users 
MODIFY COLUMN role ENUM('customer', 'mechanic', 'secretary', 'admin') NOT NULL;

-- Create initial admin user (password should be changed immediately)
INSERT INTO users (username, email, password, full_name, id_number, role, is_active)
VALUES (
  'admin',
  'admin@garage.com',
  '$2a$10$yourhashpassword', -- Generate this using bcrypt
  'System Administrator',
  'ADMIN001',
  'admin',
  true
);