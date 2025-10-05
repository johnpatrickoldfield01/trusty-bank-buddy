-- Create table for treasury transfer requests
CREATE TABLE public.treasury_transfer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL, -- 'treasury', 'main_bank', 'fx'
  destination_type TEXT NOT NULL, -- 'main_bank', 'fx', 'treasury'
  source_currency TEXT NOT NULL,
  destination_currency TEXT,
  amount NUMERIC NOT NULL,
  transfer_type TEXT NOT NULL, -- 'internal_liquidity', 'capital_injection', 'fx_allocation', 'fx_spot', 'fx_forward', 'fx_swap'
  exchange_rate NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'posted', 'settled'
  cbs_posting_status TEXT DEFAULT 'queued', -- 'queued', 'validated', 'posted', 'settled', 'failed'
  source_account_id UUID,
  destination_account_id UUID,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  authorized_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  settled_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.treasury_transfer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transfer requests"
  ON public.treasury_transfer_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transfer requests"
  ON public.treasury_transfer_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transfer requests"
  ON public.treasury_transfer_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create table for transfer audit log
CREATE TABLE public.treasury_transfer_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'authorized', 'validated', 'approved', 'rejected', 'posted', 'settled'
  performed_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.treasury_transfer_audit ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view audit logs for their transfers"
  ON public.treasury_transfer_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.treasury_transfer_requests
      WHERE id = transfer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all audit logs"
  ON public.treasury_transfer_audit
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_treasury_transfers_user_id ON public.treasury_transfer_requests(user_id);
CREATE INDEX idx_treasury_transfers_status ON public.treasury_transfer_requests(status);
CREATE INDEX idx_treasury_transfers_cbs_status ON public.treasury_transfer_requests(cbs_posting_status);
CREATE INDEX idx_treasury_audit_transfer_id ON public.treasury_transfer_audit(transfer_id);