-- Create wallet addresses table
CREATE TABLE public.crypto_wallet_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_name TEXT NOT NULL,
  cryptocurrency TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  address_label TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crypto_wallet_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own wallet addresses" 
ON public.crypto_wallet_addresses 
FOR ALL 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_crypto_wallet_addresses_user_id ON public.crypto_wallet_addresses(user_id);
CREATE INDEX idx_crypto_wallet_addresses_exchange_crypto ON public.crypto_wallet_addresses(exchange_name, cryptocurrency);

-- Create trigger for updated_at
CREATE TRIGGER update_crypto_wallet_addresses_updated_at
BEFORE UPDATE ON public.crypto_wallet_addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();