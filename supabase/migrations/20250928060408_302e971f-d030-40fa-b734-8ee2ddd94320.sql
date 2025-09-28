-- Fix treasury_users password exposure security vulnerability
-- Drop the overly permissive policy that allows treasury staff to view all treasury users including passwords
DROP POLICY IF EXISTS "Treasury staff can view treasury users" ON public.treasury_users;

-- Create a more secure policy that restricts password access
-- Only allow users to view their own record or allow admins to view all (but password should be handled separately)
CREATE POLICY "Treasury users can view their own profile"
ON public.treasury_users
FOR SELECT
USING (auth.uid()::text = email);

-- Allow admins to view all treasury users (they need this for management, but app code should exclude passwords)
CREATE POLICY "Admins can view treasury users"
ON public.treasury_users
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create a secure view that excludes password hashes
DROP VIEW IF EXISTS public.treasury_users_safe;
CREATE VIEW public.treasury_users_safe AS
SELECT 
  id,
  created_at,
  email,
  full_name,
  role
FROM public.treasury_users;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.treasury_users_safe TO authenticated;