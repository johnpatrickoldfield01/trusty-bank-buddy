-- Create crypto_transactions table to store blockchain transaction data
CREATE TABLE IF NOT EXISTS public.crypto_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  network TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  confirmations INTEGER DEFAULT 0,
  from_address TEXT,
  to_address TEXT,
  amount TEXT,
  fee TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  explorer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own crypto transactions"
  ON public.crypto_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert their own crypto transactions"
  ON public.crypto_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user_id ON public.crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_tx_hash ON public.crypto_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_network ON public.crypto_transactions(network);