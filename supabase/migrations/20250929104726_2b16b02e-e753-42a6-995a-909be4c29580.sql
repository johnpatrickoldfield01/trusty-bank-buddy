-- Fix security issue: Remove publicly accessible treasury_users_safe view
-- This view exposed treasury staff personal information without any access controls

-- Drop the treasury_users_safe view as it creates a security vulnerability
-- by exposing treasury staff personal data without proper access controls
DROP VIEW IF EXISTS public.treasury_users_safe;

-- Note: The treasury_users table already has proper RLS policies that restrict access:
-- - Admins can manage treasury users
-- - Admins can view treasury users  
-- - Treasury users can view their own profile
-- This provides proper security for treasury staff data access.