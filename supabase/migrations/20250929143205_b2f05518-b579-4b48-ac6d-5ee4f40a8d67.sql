-- Insert treasury holdings data for different regions and countries
-- Each treasury will have approximately 2 billion in mixed currencies

-- EMEA Region Holdings
-- United Kingdom Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('GBP', 'British Pound Sterling', 800000000, 0.12, 0.35, 1.0),
('USD', 'US Dollar', 600000000, 0.10, 0.40, 0.8),
('EUR', 'Euro', 400000000, 0.11, 0.32, 0.9),
('ZAR', 'South African Rand', 200000000, 0.15, 0.28, 1.2);

-- Germany Treasury  
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('EUR', 'Euro', 900000000, 0.10, 0.38, 0.9),
('USD', 'US Dollar', 500000000, 0.09, 0.42, 0.8),
('GBP', 'British Pound Sterling', 400000000, 0.12, 0.30, 1.0),
('ZAR', 'South African Rand', 200000000, 0.16, 0.25, 1.3);

-- France Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('EUR', 'Euro', 850000000, 0.11, 0.36, 0.9),
('USD', 'US Dollar', 550000000, 0.10, 0.39, 0.8),
('GBP', 'British Pound Sterling', 350000000, 0.13, 0.29, 1.0),
('ZAR', 'South African Rand', 250000000, 0.17, 0.26, 1.4);

-- South Africa Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('ZAR', 'South African Rand', 1000000000, 0.15, 0.33, 1.1),
('USD', 'US Dollar', 500000000, 0.08, 0.45, 0.7),
('EUR', 'Euro', 300000000, 0.10, 0.35, 0.9),
('GBP', 'British Pound Sterling', 200000000, 0.12, 0.28, 1.0);

-- UAE Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('AED', 'UAE Dirham', 700000000, 0.14, 0.30, 1.0),
('USD', 'US Dollar', 700000000, 0.09, 0.43, 0.8),
('EUR', 'Euro', 350000000, 0.11, 0.34, 0.9),
('ZAR', 'South African Rand', 250000000, 0.16, 0.25, 1.3);

-- Switzerland Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('CHF', 'Swiss Franc', 800000000, 0.08, 0.45, 0.7),
('USD', 'US Dollar', 600000000, 0.09, 0.41, 0.8),
('EUR', 'Euro', 400000000, 0.10, 0.37, 0.9),
('ZAR', 'South African Rand', 200000000, 0.15, 0.27, 1.2);

-- North America Region Holdings
-- United States Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('USD', 'US Dollar', 1200000000, 0.08, 0.50, 0.6),
('EUR', 'Euro', 400000000, 0.10, 0.35, 0.9),
('GBP', 'British Pound Sterling', 250000000, 0.12, 0.30, 1.0),  
('ZAR', 'South African Rand', 150000000, 0.18, 0.22, 1.5);

-- Canada Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('CAD', 'Canadian Dollar', 900000000, 0.10, 0.40, 0.9),
('USD', 'US Dollar', 700000000, 0.08, 0.45, 0.7),
('EUR', 'Euro', 250000000, 0.11, 0.32, 0.9),
('ZAR', 'South African Rand', 150000000, 0.17, 0.24, 1.4);

-- Mexico Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('MXN', 'Mexican Peso', 800000000, 0.15, 0.28, 1.2),
('USD', 'US Dollar', 800000000, 0.09, 0.42, 0.8),
('EUR', 'Euro', 250000000, 0.12, 0.30, 1.0),
('ZAR', 'South African Rand', 150000000, 0.18, 0.23, 1.5);

-- LATAM Region Holdings  
-- Brazil Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('BRL', 'Brazilian Real', 900000000, 0.16, 0.25, 1.3),
('USD', 'US Dollar', 700000000, 0.10, 0.38, 0.8),
('EUR', 'Euro', 250000000, 0.12, 0.31, 1.0),
('ZAR', 'South African Rand', 150000000, 0.18, 0.22, 1.5);

-- Argentina Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('ARS', 'Argentine Peso', 700000000, 0.20, 0.20, 1.6), 
('USD', 'US Dollar', 800000000, 0.12, 0.35, 0.9),
('EUR', 'Euro', 300000000, 0.13, 0.29, 1.0),
('ZAR', 'South African Rand', 200000000, 0.17, 0.24, 1.4);

-- Chile Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('CLP', 'Chilean Peso', 800000000, 0.14, 0.30, 1.1),
('USD', 'US Dollar', 750000000, 0.10, 0.40, 0.8),
('EUR', 'Euro', 300000000, 0.11, 0.33, 0.9),
('ZAR', 'South African Rand', 150000000, 0.16, 0.25, 1.3);

-- Colombia Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('COP', 'Colombian Peso', 850000000, 0.15, 0.27, 1.2),
('USD', 'US Dollar', 700000000, 0.11, 0.37, 0.8),
('EUR', 'Euro', 300000000, 0.12, 0.31, 1.0),
('ZAR', 'South African Rand', 150000000, 0.17, 0.24, 1.4);

-- Peru Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('PEN', 'Peruvian Sol', 800000000, 0.13, 0.32, 1.1),
('USD', 'US Dollar', 750000000, 0.10, 0.39, 0.8),
('EUR', 'Euro', 300000000, 0.11, 0.33, 0.9),
('ZAR', 'South African Rand', 150000000, 0.16, 0.25, 1.3);

-- APAC Region Holdings
-- Japan Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('JPY', 'Japanese Yen', 1000000000, 0.09, 0.43, 0.8),
('USD', 'US Dollar', 600000000, 0.08, 0.47, 0.7),
('EUR', 'Euro', 250000000, 0.10, 0.36, 0.9),
('ZAR', 'South African Rand', 150000000, 0.15, 0.26, 1.2);

-- China Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('CNY', 'Chinese Yuan', 1100000000, 0.10, 0.38, 0.9),
('USD', 'US Dollar', 600000000, 0.08, 0.45, 0.7),
('EUR', 'Euro', 200000000, 0.11, 0.33, 1.0),
('ZAR', 'South African Rand', 100000000, 0.16, 0.25, 1.3);

-- Australia Treasury  
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('AUD', 'Australian Dollar', 900000000, 0.11, 0.36, 0.9),
('USD', 'US Dollar', 650000000, 0.09, 0.42, 0.8), 
('EUR', 'Euro', 300000000, 0.10, 0.35, 0.9),
('ZAR', 'South African Rand', 150000000, 0.15, 0.27, 1.2);

-- Singapore Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('SGD', 'Singapore Dollar', 800000000, 0.09, 0.41, 0.8),
('USD', 'US Dollar', 700000000, 0.08, 0.46, 0.7),
('EUR', 'Euro', 350000000, 0.10, 0.36, 0.9),
('ZAR', 'South African Rand', 150000000, 0.15, 0.26, 1.2);

-- Hong Kong Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('HKD', 'Hong Kong Dollar', 800000000, 0.10, 0.39, 0.8),
('USD', 'US Dollar', 750000000, 0.08, 0.44, 0.7),
('EUR', 'Euro', 300000000, 0.11, 0.34, 0.9),
('ZAR', 'South African Rand', 150000000, 0.16, 0.25, 1.3);

-- India Treasury
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('INR', 'Indian Rupee', 1000000000, 0.12, 0.33, 1.0),
('USD', 'US Dollar', 600000000, 0.09, 0.40, 0.8),
('EUR', 'Euro', 250000000, 0.11, 0.35, 0.9),
('ZAR', 'South African Rand', 150000000, 0.17, 0.24, 1.4);