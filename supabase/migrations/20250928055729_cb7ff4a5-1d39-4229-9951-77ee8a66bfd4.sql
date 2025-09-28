-- Add user_id column to listing_applications table
ALTER TABLE public.listing_applications 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set a default user_id for existing records (if any)
-- This assumes all existing applications belong to the first user in auth.users
-- In production, you'd want to handle this more carefully
UPDATE public.listing_applications 
SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting defaults
ALTER TABLE public.listing_applications 
ALTER COLUMN user_id SET NOT NULL;

-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Listing applications manageable by authenticated users" ON public.listing_applications;

-- Create secure RLS policies that restrict access to own applications only
CREATE POLICY "Users can view their own listing applications"
ON public.listing_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own listing applications"
ON public.listing_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listing applications"
ON public.listing_applications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listing applications"
ON public.listing_applications
FOR DELETE
USING (auth.uid() = user_id);

-- Optional: Allow admins to view all applications (uncomment if needed)
-- CREATE POLICY "Admins can view all listing applications"
-- ON public.listing_applications
-- FOR SELECT
-- USING (public.has_role(auth.uid(), 'admin'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_listing_applications_user_id 
ON public.listing_applications(user_id);