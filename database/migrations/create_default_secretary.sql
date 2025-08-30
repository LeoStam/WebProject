-- Create default secretary user
USE garage_db;

-- First, check if the secretary user already exists
SET @secretary_exists = (SELECT COUNT(*) FROM users WHERE username = 'secretary');

-- If the secretary doesn't exist, create it
INSERT INTO users (username, email, password, full_name, id_number, role, is_active)
SELECT 
    'secretary',
    'secretary@garage.com',
    -- Password is 'Admin123!'
    '$2b$10$kl/uC.8HeE6aAAW.FqFZWOvCn.YsgpUl10KMa6/UAzUkvrE7G7pn.',
    'System Administrator',
    'SEC001',
    'secretary',
    true
WHERE @secretary_exists = 0;
