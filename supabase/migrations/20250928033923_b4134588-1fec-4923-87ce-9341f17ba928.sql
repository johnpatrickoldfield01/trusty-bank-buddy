-- Create beneficiaries table for KYC-verified accounts
CREATE TABLE public.beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  beneficiary_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  swift_code TEXT,
  branch_code TEXT,
  beneficiary_email TEXT,
  kyc_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bulk payment schedules table
CREATE TABLE public.bulk_payment_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  schedule_name TEXT NOT NULL,
  beneficiary_ids UUID[] NOT NULL,
  amount_per_beneficiary NUMERIC NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  next_execution_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bank transfer errors table for external bank notifications
CREATE TABLE public.bank_transfer_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  beneficiary_id UUID NOT NULL,
  transfer_amount NUMERIC NOT NULL,
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_source TEXT NOT NULL, -- 'recipient_bank'
  fix_provisions TEXT,
  notification_sent BOOLEAN DEFAULT false,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create database change requests table
CREATE TABLE public.db_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_email TEXT NOT NULL,
  request_type TEXT NOT NULL,
  current_naming TEXT,
  proposed_naming TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transfer_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_change_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for beneficiaries
CREATE POLICY "Users can manage their own beneficiaries" 
ON public.beneficiaries 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for bulk payment schedules
CREATE POLICY "Users can manage their own payment schedules" 
ON public.bulk_payment_schedules 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for bank transfer errors
CREATE POLICY "Users can view their own transfer errors" 
ON public.bank_transfer_errors 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for database change requests
CREATE POLICY "Database personnel can view all requests" 
ON public.db_change_requests 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert change requests" 
ON public.db_change_requests 
FOR INSERT 
WITH CHECK (true);

-- Insert sample beneficiaries for testing
INSERT INTO public.beneficiaries (user_id, beneficiary_name, bank_name, account_number, swift_code, branch_code, beneficiary_email, kyc_verified) VALUES
(gen_random_uuid(), 'John Smith Business Account', 'Standard Bank', '1234567890', 'SBZAZAJJ', '051001', 'john.smith@business.com', true),
(gen_random_uuid(), 'Mary Johnson Savings', 'FNB', '0987654321', 'FIRNZAJJ', '250655', 'mary.johnson@personal.com', true),
(gen_random_uuid(), 'Corporate Solutions Ltd', 'ABSA Bank', '1122334455', 'ABZAZAJJ', '632005', 'finance@corpsolutions.co.za', true),
(gen_random_uuid(), 'Investment Holdings', 'Nedbank', '5566778899', 'NEDSZAJJ', '198765', 'invest@holdings.co.za', true);

-- Insert sample transfer errors for testing
INSERT INTO public.bank_transfer_errors (user_id, beneficiary_id, transfer_amount, error_code, error_message, error_source, fix_provisions) VALUES
(gen_random_uuid(), (SELECT id FROM public.beneficiaries LIMIT 1), 15000.00, 'INSUF_FUNDS', 'Insufficient funds in recipient account verification', 'recipient_bank', 'Contact recipient to confirm account details and ensure account is active'),
(gen_random_uuid(), (SELECT id FROM public.beneficiaries OFFSET 1 LIMIT 1), 25000.00, 'ACCT_CLOSED', 'Recipient account has been closed', 'recipient_bank', 'Obtain new account details from beneficiary or use alternative payment method');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_beneficiaries_updated_at
BEFORE UPDATE ON public.beneficiaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bulk_payment_schedules_updated_at
BEFORE UPDATE ON public.bulk_payment_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();