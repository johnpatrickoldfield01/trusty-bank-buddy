-- Update the primary account balance to R1,000,000,000
UPDATE accounts 
SET balance = 1000000000.00 
WHERE account_type = 'savings' 
AND account_name = 'Savings Account';