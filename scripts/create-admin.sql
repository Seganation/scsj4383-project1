-- SQL script to create an admin user
-- Run this in your PostgreSQL database

-- First, create a regular user through the sign-up process at http://localhost:3000/sign-up
-- Use these credentials:
-- Email: admin@archcool.com
-- Password: AdminPassword123!

-- Then run this SQL to upgrade them to admin:
UPDATE "User"
SET role = 'admin'
WHERE email = 'admin@archcool.com';

-- Verify the admin user was created:
SELECT id, email, name, role, "createdAt"
FROM "User"
WHERE role = 'admin';
