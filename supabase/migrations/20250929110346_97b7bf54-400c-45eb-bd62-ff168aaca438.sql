-- Fix additional security vulnerability: Restrict treasury transaction access  
-- Treasury transactions should only be accessible to treasury personnel

-- Drop overly permissive policies for treasury transactions
DROP POLICY IF EXISTS "Treasury transactions viewable by all" ON public.treasury_transactions;
DROP POLICY IF EXISTS "Treasury transactions manageable by all" ON public.treasury_transactions;

-- Create secure policy: Only treasury staff can view treasury transactions
CREATE POLICY "Treasury staff can view treasury transactions"
ON public.treasury_transactions
FOR SELECT  
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'treasury_officer') OR
  auth.uid() = executed_by
);

-- Create secure policy: Only treasury staff can manage treasury transactions  
CREATE POLICY "Treasury staff can manage treasury transactions"
ON public.treasury_transactions
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'treasury_officer')
);

-- Also fix treasury holdings access
DROP POLICY IF EXISTS "Treasury holdings viewable by all" ON public.treasury_holdings;
DROP POLICY IF EXISTS "Treasury holdings manageable by all" ON public.treasury_holdings;

-- Create secure policy: Only treasury staff can view treasury holdings
CREATE POLICY "Treasury staff can view treasury holdings"
ON public.treasury_holdings
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'treasury_officer')
);

-- Create secure policy: Only treasury staff can manage treasury holdings
CREATE POLICY "Treasury staff can manage treasury holdings" 
ON public.treasury_holdings
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'treasury_officer')
);