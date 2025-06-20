
-- Update the main account balance back to R80,000,000
-- First, let's find and update the main account for the current user
UPDATE public.accounts 
SET balance = 80000000.00 
WHERE account_type = 'main' 
AND user_id = auth.uid();
