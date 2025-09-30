-- Fix main account balance to R1,500,000,000
UPDATE accounts 
SET balance = 1500000000.00 
WHERE account_type = 'main' 
AND account_name = 'Main Account' 
AND balance = (
  SELECT MAX(balance) 
  FROM accounts 
  WHERE account_type = 'main' 
  AND account_name = 'Main Account'
);

-- Ensure we have a proper second savings account that will show in the dashboard
INSERT INTO accounts (user_id, account_type, account_name, account_number, balance)
SELECT 
  user_id,
  'savings'::account_type,
  'Additional Savings Account',
  '1234567890123457',
  0.00
FROM accounts 
WHERE account_type = 'main' 
AND account_name = 'Main Account'
LIMIT 1
ON CONFLICT DO NOTHING;