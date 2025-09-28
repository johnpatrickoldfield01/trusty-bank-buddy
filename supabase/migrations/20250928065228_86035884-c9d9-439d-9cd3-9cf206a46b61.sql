-- Add bank_email column to beneficiaries table
ALTER TABLE public.beneficiaries 
ADD COLUMN bank_email TEXT;