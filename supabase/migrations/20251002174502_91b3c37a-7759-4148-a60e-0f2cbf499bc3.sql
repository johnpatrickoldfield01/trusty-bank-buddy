-- Create email scheduler settings table
CREATE TABLE IF NOT EXISTS public.email_scheduler_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_address TEXT NOT NULL,
  salary_slip_enabled BOOLEAN DEFAULT false,
  bank_summary_enabled BOOLEAN DEFAULT false,
  crypto_summary_enabled BOOLEAN DEFAULT false,
  treasury_summary_enabled BOOLEAN DEFAULT false,
  bug_report_enabled BOOLEAN DEFAULT false,
  schedule_enabled BOOLEAN DEFAULT true,
  last_sent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_scheduler_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own email scheduler settings"
ON public.email_scheduler_settings
FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_email_scheduler_settings_updated_at
BEFORE UPDATE ON public.email_scheduler_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();