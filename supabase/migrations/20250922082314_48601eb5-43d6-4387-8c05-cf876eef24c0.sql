-- Update the main account balance to R150,000,000
UPDATE public.accounts 
SET balance = 150000000.00 
WHERE account_type = 'main' 
AND user_id = (SELECT auth.uid())
AND created_at = (
  SELECT MAX(created_at) 
  FROM public.accounts 
  WHERE account_type = 'main' 
  AND user_id = (SELECT auth.uid())
);

-- Update the savings account balance to R50,000,000  
UPDATE public.accounts 
SET balance = 50000000.00 
WHERE account_type = 'savings' 
AND user_id = (SELECT auth.uid())
AND created_at = (
  SELECT MAX(created_at) 
  FROM public.accounts 
  WHERE account_type = 'savings' 
  AND user_id = (SELECT auth.uid())
);