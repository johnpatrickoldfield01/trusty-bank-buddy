-- Fix savings account balance and create new mock salary account
UPDATE accounts 
SET balance = CASE 
  WHEN account_type = 'savings' AND balance > 10000000 THEN 250000.00  -- Reset to reasonable amount
  ELSE balance 
END
WHERE account_type = 'savings' AND balance > 10000000;

-- Create job_salary_setups table to track linked salaries
CREATE TABLE IF NOT EXISTS job_salary_setups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  annual_salary NUMERIC NOT NULL,
  monthly_gross NUMERIC NOT NULL,
  monthly_net NUMERIC NOT NULL,
  fnb_account_holder TEXT NOT NULL,
  fnb_account_number TEXT NOT NULL,
  fnb_branch_code TEXT NOT NULL,
  mock_account_id UUID,
  setup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  auto_email_enabled BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE job_salary_setups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own salary setups" 
ON job_salary_setups 
FOR ALL 
USING (auth.uid() = user_id);

-- Create auto-payment schedule table
CREATE TABLE IF NOT EXISTS monthly_salary_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salary_setup_id UUID NOT NULL REFERENCES job_salary_setups(id) ON DELETE CASCADE,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount_paid NUMERIC NOT NULL,
  account_type TEXT NOT NULL, -- 'fnb' or 'mock'
  payment_status TEXT NOT NULL DEFAULT 'pending',
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for payments
ALTER TABLE monthly_salary_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Users can view their own salary payments" 
ON monthly_salary_payments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM job_salary_setups 
  WHERE job_salary_setups.id = monthly_salary_payments.salary_setup_id 
  AND job_salary_setups.user_id = auth.uid()
));