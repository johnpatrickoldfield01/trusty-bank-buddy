-- Update account numbers to follow banking standards
-- South African bank account numbers (typically 10-11 digits)
-- Standard Bank format: Branch (6 digits) + Account (5 digits)
-- FNB format: Branch (6 digits) + Account (5 digits)
-- ABSA format: Branch (6 digits) + Account (5 digits)

-- Update main account with Standard Bank format
UPDATE accounts 
SET account_number = '05114531001', account_name = 'Main Account'
WHERE account_type = 'main' AND account_name = 'Main Account';

-- Update savings accounts with proper numbering and different bank formats
UPDATE accounts 
SET 
  account_number = CASE 
    WHEN account_name = 'Savings Account' THEN '05114532001'
    WHEN account_name = 'Additional Savings Account' THEN '25102533001' 
    WHEN account_name = 'Senior Software Engineer Salary Account' THEN '63205534001'
    ELSE account_number
  END,
  account_name = CASE 
    WHEN account_name = 'Savings Account' THEN 'Savings Account 1'
    WHEN account_name = 'Additional Savings Account' THEN 'Savings Account 2'
    WHEN account_name = 'Senior Software Engineer Salary Account' THEN 'Savings Account 3'
    ELSE account_name
  END
WHERE account_type = 'savings';

-- Update credit cards with valid Luhn algorithm compliant numbers
-- Visa starts with 4, MasterCard starts with 5, American Express starts with 3
UPDATE accounts 
SET account_number = '4532015112830366'  -- Valid Visa test number
WHERE account_type = 'credit' AND account_name LIKE '%Credit%';

-- Update loan accounts with proper loan account formats
UPDATE accounts 
SET account_number = CASE 
    WHEN account_name LIKE 'Business Loan%' THEN '05114540001'
    WHEN account_name LIKE 'Home Loan%' THEN '05114550001'
    ELSE account_number
  END
WHERE account_type = 'loan';