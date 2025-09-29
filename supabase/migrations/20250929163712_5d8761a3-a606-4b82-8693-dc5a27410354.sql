-- Update transactions table to support cryptocurrency precision
ALTER TABLE transactions 
ALTER COLUMN amount TYPE NUMERIC(20,8);

-- Add a comment to document the precision requirement
COMMENT ON COLUMN transactions.amount IS 'Amount with 8 decimal precision for cryptocurrency support';

-- Update any existing 0 amounts that should be small crypto values
-- Note: This is a precautionary update for any existing zero amounts from crypto transactions