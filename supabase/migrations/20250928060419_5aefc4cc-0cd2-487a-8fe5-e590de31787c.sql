-- Fix the Security Definer View issue by recreating the view with proper ownership
DROP VIEW IF EXISTS public.treasury_users_safe;

-- Create the view without SECURITY DEFINER (default is SECURITY INVOKER which is safer)
CREATE VIEW public.treasury_users_safe WITH (security_invoker=true) AS
SELECT 
  id,
  created_at,
  email,
  full_name,
  role
FROM public.treasury_users;

-- Enable RLS on the underlying table (already done but ensuring it's set)
ALTER TABLE public.treasury_users ENABLE ROW LEVEL SECURITY;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.treasury_users_safe TO authenticated;