
-- Create a table for user profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY, -- This is the user_id from auth.users
  full_name TEXT,
  CONSTRAINT id_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Commenting this out as we will handle profile creation from the client side
-- to pass user metadata. The function and trigger setup is a good pattern, but
-- for simplicity and to ensure we can pass the full name from the sign-up form,
-- we'll manage this in the application code.

-- Function to create a profile for a new user
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER SET search_path = public
-- AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, full_name)
--   VALUES (new.id, new.raw_user_meta_data->>'full_name');
--   RETURN new;
-- END;
-- $$;

-- Trigger the function on new user creation
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create an enum type for account types
CREATE TYPE public.account_type AS ENUM ('main', 'savings', 'credit');

-- Create a table for bank accounts
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type public.account_type NOT NULL,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  account_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policies for accounts
CREATE POLICY "Users can manage their own accounts."
  ON public.accounts FOR ALL
  USING (auth.uid() = user_id);

-- Create a table for transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  category TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  icon TEXT
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can manage transactions for their own accounts."
  ON public.transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.accounts
      WHERE accounts.id = transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

