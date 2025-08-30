ALTER TABLE users 
MODIFY COLUMN role ENUM('customer', 'mechanic', 'secretary', 'admin') NOT NULL;

-- Create initial secretary user with admin privileges (password should be changed immediately)
INSERT INTO users (username, email, password, full_name, id_number, role, is_active)
SELECT 
    'secretary',
    'secretary@garage.com',
    -- Default password is 'Admin123!' - should be changed immediately
    '$2b$10$lzqvgzve.qcdsddvxzev7.frg/mfdx8zwhfe.prscy3kel5f8m3i',
    'System Administrator',
    'SEC001',
    'secretary',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role IN ('secretary', 'admin')
) LIMIT 1;