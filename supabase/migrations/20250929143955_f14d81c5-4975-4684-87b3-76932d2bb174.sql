-- Fix critical security vulnerability in cbs_lawyer_letters table
-- Replace the overly permissive SELECT policy with a properly restricted one

-- Drop the current vulnerable SELECT policy
DROP POLICY IF EXISTS "CBS lawyer letters viewable by authenticated users" ON public.cbs_lawyer_letters;

-- Create a secure SELECT policy that only allows users to view their own letters
CREATE POLICY "Users can view their own lawyer letters" 
ON public.cbs_lawyer_letters 
FOR SELECT 
USING (auth.uid() = user_id);

-- Verify the ALL policy is also secure (it should already be correct)
-- The existing policy "CBS lawyer letters manageable by authenticated users" with 
-- USING (auth.uid() = user_id) is already secure for INSERT/UPDATE/DELETE operations