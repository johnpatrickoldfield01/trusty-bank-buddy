-- Create CBS (Central Banking System) Dashboard Tables
CREATE TABLE public.cbs_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  account_reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  compliance_status TEXT NOT NULL DEFAULT 'reviewing' CHECK (compliance_status IN ('reviewing', 'approved', 'flagged')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID
);

CREATE TABLE public.cbs_lawyer_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  credit_amount NUMERIC NOT NULL,
  letter_content TEXT NOT NULL,
  account_to_credit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.cbs_balance_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  old_balance NUMERIC NOT NULL,
  new_balance NUMERIC NOT NULL,
  adjustment_amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  compliance_approved BOOLEAN DEFAULT FALSE,
  updated_by UUID NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Treasury Dashboard Tables
CREATE TABLE public.treasury_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'treasury_officer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.treasury_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency_code TEXT NOT NULL,
  currency_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  reserve_ratio NUMERIC NOT NULL DEFAULT 0.1,
  liquidity_ratio NUMERIC NOT NULL DEFAULT 0.3,
  risk_weight NUMERIC NOT NULL DEFAULT 1.0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

CREATE TABLE public.treasury_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  exchange_rate NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('conversion', 'injection', 'withdrawal', 'adjustment')),
  reason TEXT,
  executed_by UUID NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Job Portal Dashboard Tables
CREATE TABLE public.job_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE public.job_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category_id UUID NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  expected_salary_min NUMERIC NOT NULL,
  expected_salary_max NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  location TEXT NOT NULL,
  remote_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Stock Exchange Dashboard Tables
CREATE TABLE public.stock_exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  currency TEXT NOT NULL,
  trading_hours TEXT NOT NULL,
  website TEXT,
  market_cap_requirement NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.listing_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exchange_id UUID NOT NULL,
  requirement_type TEXT NOT NULL,
  description TEXT NOT NULL,
  mandatory BOOLEAN DEFAULT TRUE,
  documents_required TEXT[]
);

CREATE TABLE public.listing_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  exchange_id UUID NOT NULL,
  applicant_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  documents_uploaded JSONB DEFAULT '{}',
  application_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.cbs_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbs_lawyer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbs_balance_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- CBS policies (admin only for now)
CREATE POLICY "CBS notes viewable by authenticated users" ON public.cbs_notes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "CBS notes manageable by authenticated users" ON public.cbs_notes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "CBS lawyer letters viewable by authenticated users" ON public.cbs_lawyer_letters FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "CBS lawyer letters manageable by authenticated users" ON public.cbs_lawyer_letters FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "CBS balance updates viewable by authenticated users" ON public.cbs_balance_updates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "CBS balance updates manageable by authenticated users" ON public.cbs_balance_updates FOR ALL USING (auth.uid() = updated_by);

-- Treasury policies (accessible to all authenticated users for demo)
CREATE POLICY "Treasury holdings viewable by all" ON public.treasury_holdings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Treasury holdings manageable by all" ON public.treasury_holdings FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Treasury transactions viewable by all" ON public.treasury_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Treasury transactions manageable by all" ON public.treasury_transactions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Treasury users viewable by all" ON public.treasury_users FOR SELECT USING (auth.uid() IS NOT NULL);

-- Job portal policies (public readable)
CREATE POLICY "Job categories readable by all" ON public.job_categories FOR SELECT USING (true);
CREATE POLICY "Job listings readable by all" ON public.job_listings FOR SELECT USING (true);

-- Stock exchange policies (public readable)
CREATE POLICY "Stock exchanges readable by all" ON public.stock_exchanges FOR SELECT USING (true);
CREATE POLICY "Listing requirements readable by all" ON public.listing_requirements FOR SELECT USING (true);
CREATE POLICY "Listing applications manageable by authenticated users" ON public.listing_applications FOR ALL USING (auth.uid() IS NOT NULL);

-- Add foreign key relationships
ALTER TABLE public.listing_requirements ADD CONSTRAINT fk_listing_requirements_exchange 
  FOREIGN KEY (exchange_id) REFERENCES public.stock_exchanges(id) ON DELETE CASCADE;

ALTER TABLE public.listing_applications ADD CONSTRAINT fk_listing_applications_exchange 
  FOREIGN KEY (exchange_id) REFERENCES public.stock_exchanges(id) ON DELETE CASCADE;

ALTER TABLE public.job_listings ADD CONSTRAINT fk_job_listings_category 
  FOREIGN KEY (category_id) REFERENCES public.job_categories(id) ON DELETE CASCADE;

-- Insert treasury user
INSERT INTO public.treasury_users (email, password_hash, full_name, role) 
VALUES ('oldfieldjohnpatrick@gmail.com', '$2a$10$dummy_hash_for_demo', 'John Patrick Oldfield', 'treasury_manager');

-- Insert initial treasury holdings (100 Billion mixed currencies)
INSERT INTO public.treasury_holdings (currency_code, currency_name, amount, reserve_ratio, liquidity_ratio, risk_weight) VALUES
('USD', 'US Dollar', 25000000000, 0.10, 0.30, 1.0),
('EUR', 'Euro', 20000000000, 0.10, 0.25, 1.0),
('GBP', 'British Pound', 15000000000, 0.10, 0.25, 1.0),
('JPY', 'Japanese Yen', 2000000000000, 0.05, 0.35, 0.8),
('CHF', 'Swiss Franc', 10000000000, 0.15, 0.20, 0.9),
('CAD', 'Canadian Dollar', 8000000000, 0.08, 0.30, 1.0),
('AUD', 'Australian Dollar', 7000000000, 0.08, 0.30, 1.0),
('ZAR', 'South African Rand', 5000000000, 0.12, 0.40, 1.2),
('CNY', 'Chinese Yuan', 8000000000, 0.15, 0.25, 1.1);

-- Insert job categories
INSERT INTO public.job_categories (name, description) VALUES
('Banking & Finance', 'Banking, investment, and financial services roles'),
('Consulting', 'Management and strategy consulting positions'),
('Technology', 'Software development and IT roles'),
('Marketing & Sales', 'Marketing, sales, and business development'),
('Operations', 'Operations management and process optimization'),
('Risk Management', 'Risk analysis and compliance roles');

-- Insert sample commerce graduate jobs
INSERT INTO public.job_listings (title, category_id, description, requirements, expected_salary_min, expected_salary_max, currency, experience_level, location, remote_available) 
SELECT 
  title, 
  (SELECT id FROM public.job_categories WHERE name = category),
  description,
  requirements,
  salary_min,
  salary_max,
  'USD',
  experience_level,
  location,
  remote_available
FROM (VALUES
  ('Investment Banking Analyst', 'Banking & Finance', 'Analyze financial data and support M&A transactions', 'Commerce degree, Excel proficiency, financial modeling', 85000, 120000, 'entry', 'New York, NY', true),
  ('Management Consultant', 'Consulting', 'Provide strategic advice to Fortune 500 companies', 'Commerce/Business degree, analytical skills, presentation skills', 90000, 130000, 'entry', 'Boston, MA', false),
  ('Financial Analyst', 'Banking & Finance', 'Prepare financial reports and forecasts', 'Commerce degree, accounting knowledge, Excel/SQL', 65000, 85000, 'entry', 'Chicago, IL', true),
  ('Business Development Associate', 'Marketing & Sales', 'Identify new business opportunities and partnerships', 'Commerce degree, sales aptitude, communication skills', 55000, 75000, 'entry', 'San Francisco, CA', true),
  ('Operations Analyst', 'Operations', 'Optimize business processes and operations', 'Commerce degree, process improvement, data analysis', 60000, 80000, 'entry', 'Atlanta, GA', true),
  ('Risk Analyst', 'Risk Management', 'Assess and mitigate financial and operational risks', 'Commerce/Finance degree, risk assessment, regulatory knowledge', 70000, 95000, 'entry', 'New York, NY', false),
  ('Digital Marketing Specialist', 'Marketing & Sales', 'Develop and execute digital marketing campaigns', 'Commerce/Marketing degree, digital marketing, analytics', 50000, 70000, 'entry', 'Remote', true),
  ('Corporate Finance Analyst', 'Banking & Finance', 'Support capital allocation and financial planning', 'Commerce/Finance degree, financial modeling, Excel', 75000, 100000, 'entry', 'Los Angeles, CA', false),
  ('Strategy Consultant', 'Consulting', 'Develop business strategies for clients', 'Commerce/MBA, strategic thinking, problem-solving', 95000, 140000, 'mid', 'Washington, DC', false),
  ('Product Manager', 'Technology', 'Manage product development lifecycle', 'Commerce/Technical degree, product management, Agile', 85000, 120000, 'mid', 'Seattle, WA', true)
) AS jobs(title, category, description, requirements, salary_min, salary_max, experience_level, location, remote_available);

-- Insert major stock exchanges
INSERT INTO public.stock_exchanges (name, country, region, currency, trading_hours, website, market_cap_requirement) VALUES
('New York Stock Exchange (NYSE)', 'United States', 'North America', 'USD', '9:30 AM - 4:00 PM EST', 'https://www.nyse.com', 4000000),
('NASDAQ', 'United States', 'North America', 'USD', '9:30 AM - 4:00 PM EST', 'https://www.nasdaq.com', 1000000),
('London Stock Exchange (LSE)', 'United Kingdom', 'Europe', 'GBP', '8:00 AM - 4:30 PM GMT', 'https://www.londonstockexchange.com', 700000),
('Tokyo Stock Exchange (TSE)', 'Japan', 'Asia', 'JPY', '9:00 AM - 3:00 PM JST', 'https://www.jpx.co.jp', 1000000000),
('Shanghai Stock Exchange (SSE)', 'China', 'Asia', 'CNY', '9:30 AM - 3:00 PM CST', 'http://www.sse.com.cn', 50000000),
('Frankfurt Stock Exchange', 'Germany', 'Europe', 'EUR', '9:00 AM - 5:30 PM CET', 'https://www.boerse-frankfurt.de', 1000000),
('Toronto Stock Exchange (TSX)', 'Canada', 'North America', 'CAD', '9:30 AM - 4:00 PM EST', 'https://www.tsx.com', 5000000),
('Australian Securities Exchange (ASX)', 'Australia', 'Asia-Pacific', 'AUD', '10:00 AM - 4:00 PM AEST', 'https://www.asx.com.au', 2000000),
('Johannesburg Stock Exchange (JSE)', 'South Africa', 'Africa', 'ZAR', '9:00 AM - 5:00 PM SAST', 'https://www.jse.co.za', 75000000);

-- Insert listing requirements for each exchange
INSERT INTO public.listing_requirements (exchange_id, requirement_type, description, mandatory, documents_required) 
SELECT 
  se.id,
  'Financial',
  'Minimum market capitalization requirement',
  true,
  ARRAY['Audited Financial Statements', 'Valuation Report', 'Business Plan']
FROM public.stock_exchanges se;

INSERT INTO public.listing_requirements (exchange_id, requirement_type, description, mandatory, documents_required) 
SELECT 
  se.id,
  'Legal',
  'Corporate governance and legal compliance',
  true,
  ARRAY['Articles of Incorporation', 'Board Resolution', 'Legal Opinion', 'Compliance Certificate']
FROM public.stock_exchanges se;

INSERT INTO public.listing_requirements (exchange_id, requirement_type, description, mandatory, documents_required) 
SELECT 
  se.id,
  'Operational',
  'Business operations and track record',
  true,
  ARRAY['Business History Report', 'Management Profiles', 'Operational Plan']
FROM public.stock_exchanges se;