-- Update the most recent main account to R150,000,000
UPDATE public.accounts 
SET balance = 150000000.00 
WHERE account_type = 'main' 
AND user_id = 'e3358b22-c861-4e60-a0a5-cbf4eaae0086'
AND created_at = (
  SELECT MAX(created_at) 
  FROM public.accounts 
  WHERE account_type = 'main' 
  AND user_id = 'e3358b22-c861-4e60-a0a5-cbf4eaae0086'
);

-- Update the most recent savings account to R50,000,000  
UPDATE public.accounts 
SET balance = 50000000.00 
WHERE account_type = 'savings' 
AND user_id = 'e3358b22-c861-4e60-a0a5-cbf4eaae0086'
AND created_at = (
  SELECT MAX(created_at) 
  FROM public.accounts 
  WHERE account_type = 'savings' 
  AND user_id = 'e3358b22-c861-4e60-a0a5-cbf4eaae0086'
);