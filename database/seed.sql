-- Insert sample data for testing
USE garage_db;

-- Insert a test customer
INSERT IGNORE INTO users (id, username, email, password, full_name, id_number, role, is_active) 
VALUES (2, 'testcustomer', 'test@customer.com', '$2a$10$kl/uC.8HeE6aAAW.FqFZWOvCn.YsgpUl10KMa6/UAzUkvrE7G7pn.', 'Test Customer', 'TC001', 'customer', true);

INSERT IGNORE INTO customers (user_id, afm, address) 
VALUES (2, '123456789', 'Test Address 123');

-- Insert a test mechanic
INSERT IGNORE INTO users (id, username, email, password, full_name, id_number, role, is_active) 
VALUES (3, 'geostam', 'geostam@garage.com', '$2a$10$/riGtNrWm4pctz7lTLJK6upd7CHSIHyL0JuHzqtvzpbQumql5jENi', 'George Stamou', 'AB123789', 'mechanic', true);

INSERT IGNORE INTO mechanics (user_id, specialty) 
VALUES (3, 'General Maintenance');

-- Insert a test car
INSERT IGNORE INTO cars (vin, owner_id, brand, model, vehicle_type, fuel_type, production_year, doors_count, color, plate_number) 
VALUES ('1HGBH41JXMN109186', 2, 'Honda', 'Civic', 'passenger', 'petrol', 2020, 4, 'Blue', 'ABC-1234');

-- Insert test appointments
INSERT IGNORE INTO appointments (id, date, start_time, status, reason, problem_description, car_vin, customer_id, mechanic_id) 
VALUES 
(1, '2025-09-04', '10:00:00', 'created', 'Regular Service', 'Oil change and inspection needed', '1HGBH41JXMN109186', 2, NULL),
(2, '2025-09-05', '14:00:00', 'created', 'Brake Check', 'Brakes making noise', '1HGBH41JXMN109186', 2, 3);
