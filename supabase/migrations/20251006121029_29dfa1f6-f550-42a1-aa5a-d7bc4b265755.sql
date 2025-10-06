-- Create table for saved cryptocurrency receiving addresses
CREATE TABLE IF NOT EXISTS public.saved_crypto_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_name TEXT NOT NULL,
  cryptocurrency TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  address_label TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one default address per user/exchange/crypto combination
  CONSTRAINT unique_default_per_combo UNIQUE NULLS NOT DISTINCT (user_id, exchange_name, cryptocurrency, is_default)
);

-- Enable RLS
ALTER TABLE public.saved_crypto_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved addresses"
  ON public.saved_crypto_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved addresses"
  ON public.saved_crypto_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved addresses"
  ON public.saved_crypto_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved addresses"
  ON public.saved_crypto_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_saved_addresses_user_exchange 
  ON public.saved_crypto_addresses(user_id, exchange_name, cryptocurrency);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_saved_crypto_addresses_updated_at
  BEFORE UPDATE ON public.saved_crypto_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.saved_crypto_addresses IS 'Stores user-saved cryptocurrency receiving addresses for various exchanges';
