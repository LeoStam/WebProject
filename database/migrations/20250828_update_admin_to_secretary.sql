-- First, remove any existing admin users
DELETE FROM users WHERE role = 'admin';

-- Then create the secretary user if it doesn't exist
INSERT INTO users (username, email, password, full_name, id_number, role, is_active)
SELECT 
    'secretary',
    'secretary@garage.com',
    '$2a$10$kl/uC.8HeE6aAAW.FqFZWOvCn.YsgpUl10KMa6/UAzUkvrE7G7pn.',  -- Password is 'Admin123!'
    'System Administrator',
    'SEC001',
    'secretary',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'secretary'
);
