
CREATE OR REPLACE FUNCTION public.transfer_money(
  sender_account_id UUID,
  recipient_name TEXT,
  transfer_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_balance NUMERIC;
  account_owner_id UUID;
BEGIN
  -- Select account details and lock the row to prevent race conditions
  SELECT balance, user_id INTO current_balance, account_owner_id
  FROM public.accounts
  WHERE id = sender_account_id
  FOR UPDATE;

  -- Verify ownership
  IF account_owner_id IS NULL THEN
    RAISE EXCEPTION 'Sender account not found.';
  END IF;
  
  IF account_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Authorization error: You do not own this account.';
  END IF;

  -- Check for sufficient funds
  IF current_balance < transfer_amount THEN
    RAISE EXCEPTION 'Insufficient funds.';
  END IF;

  -- Update the sender's account balance
  UPDATE public.accounts
  SET balance = balance - transfer_amount
  WHERE id = sender_account_id;

  -- Insert a new transaction record
  INSERT INTO public.transactions(account_id, name, amount, category, icon)
  VALUES (sender_account_id, 'Transfer to ' || recipient_name, -transfer_amount, 'Transfer', '💸');
  
END;
$$;
