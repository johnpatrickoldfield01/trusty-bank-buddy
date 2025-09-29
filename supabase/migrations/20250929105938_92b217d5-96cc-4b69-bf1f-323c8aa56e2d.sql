-- Fix critical security vulnerability: Restrict access to CBS balance updates
-- Current policy allows ANY authenticated user to view ALL balance updates
-- This exposes sensitive customer financial data

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "CBS balance updates viewable by authenticated users" ON public.cbs_balance_updates;

-- Create secure policy: Only account owners can view their balance updates
CREATE POLICY "Account owners can view their balance updates"
ON public.cbs_balance_updates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.accounts 
    WHERE accounts.id = cbs_balance_updates.account_id 
    AND accounts.user_id = auth.uid()
  )
);

-- Create secure policy: Update creators can view their own updates
CREATE POLICY "Update creators can view their own updates"
ON public.cbs_balance_updates
FOR SELECT
USING (auth.uid() = updated_by);

-- Create secure policy: Admins can view all balance updates for oversight
CREATE POLICY "Admins can view all balance updates"
ON public.cbs_balance_updates
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update the manageable policy to be more restrictive
DROP POLICY IF EXISTS "CBS balance updates manageable by authenticated users" ON public.cbs_balance_updates;

-- Create secure policy: Only account owners can manage their balance updates
CREATE POLICY "Account owners can manage their balance updates"
ON public.cbs_balance_updates
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.accounts 
    WHERE accounts.id = cbs_balance_updates.account_id 
    AND accounts.user_id = auth.uid()
  )
);

-- Create secure policy: Admins can manage all balance updates
CREATE POLICY "Admins can manage all balance updates"
ON public.cbs_balance_updates
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));