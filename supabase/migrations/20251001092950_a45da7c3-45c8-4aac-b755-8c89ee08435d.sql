-- Create bug tracking table
CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  blocks_development BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Users can view all bug reports
CREATE POLICY "Users can view all bug reports"
ON public.bug_reports
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can create bug reports
CREATE POLICY "Users can create bug reports"
ON public.bug_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bug reports
CREATE POLICY "Users can update own bug reports"
ON public.bug_reports
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can update all bug reports
CREATE POLICY "Admins can update all bug reports"
ON public.bug_reports
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_bug_reports_updated_at
BEFORE UPDATE ON public.bug_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_priority ON public.bug_reports(priority);