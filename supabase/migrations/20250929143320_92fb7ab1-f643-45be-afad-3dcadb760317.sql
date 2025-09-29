-- Update all treasury holdings to 200 billion scale (multiply current amounts by 100)
UPDATE public.treasury_holdings 
SET amount = amount * 100;