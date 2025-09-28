-- Fix security vulnerability: Restrict treasury_users table access
-- Remove the overly permissive policy that allows all authenticated users to view treasury data
DROP POLICY IF EXISTS "Treasury users viewable by all" ON public.treasury_users;

-- Create a user_roles table to implement proper role-based access control
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create restrictive policies for treasury_users table
-- Only treasury staff can view treasury user data
CREATE POLICY "Treasury staff can view treasury users" 
ON public.treasury_users 
FOR SELECT 
USING (public.has_role(auth.uid(), 'treasury_staff') OR public.has_role(auth.uid(), 'admin'));

-- Only admins can manage treasury users
CREATE POLICY "Admins can manage treasury users" 
ON public.treasury_users 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only admins can manage user roles
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample admin role for testing (replace with actual admin user ID in production)
INSERT INTO public.user_roles (user_id, role) VALUES 
(gen_random_uuid(), 'admin'),
(gen_random_uuid(), 'treasury_staff')
ON CONFLICT (user_id, role) DO NOTHING;