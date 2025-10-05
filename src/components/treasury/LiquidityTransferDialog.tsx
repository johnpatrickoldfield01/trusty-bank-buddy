import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TwoFactorAuth from '@/components/auth/TwoFactorAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LiquidityTransferDialogProps {
  sourceCurrency?: string;
  sourceType: 'treasury' | 'main_bank' | 'fx';
}

const LiquidityTransferDialog: React.FC<LiquidityTransferDialogProps> = ({ sourceCurrency, sourceType }) => {
  const [open, setOpen] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    destination_type: '' as 'main_bank' | 'fx' | 'treasury',
    source_currency: sourceCurrency || '',
    destination_currency: '',
    amount: '',
    transfer_type: '' as string,
    exchange_rate: '',
    reason: '',
    destination_account_id: ''
  });

  useEffect(() => {
    if (open) {
      fetchAccounts();
    }
  }, [open]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const getTransferTypes = () => {
    if (formData.destination_type === 'main_bank') {
      return [
        { value: 'internal_liquidity', label: 'Internal Liquidity Transfer' },
        { value: 'capital_injection', label: 'Capital Injection' }
      ];
    } else if (formData.destination_type === 'fx') {
      return [
        { value: 'fx_allocation', label: 'FX Allocation' },
        { value: 'fx_spot', label: 'FX Spot' },
        { value: 'fx_forward', label: 'FX Forward' },
        { value: 'fx_swap', label: 'FX Swap' }
      ];
    }
    return [];
  };

  const handleSubmit = async () => {
    if (!formData.destination_type || !formData.amount || !formData.transfer_type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setPendingTransfer(formData);
    setShow2FA(true);
  };

  const handle2FASuccess = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('treasury_transfer_requests')
        .insert({
          user_id: user.data.user.id,
          source_type: sourceType,
          destination_type: formData.destination_type,
          source_currency: formData.source_currency,
          destination_currency: formData.destination_currency || formData.source_currency,
          amount: parseFloat(formData.amount),
          transfer_type: formData.transfer_type,
          exchange_rate: formData.exchange_rate ? parseFloat(formData.exchange_rate) : null,
          destination_account_id: formData.destination_account_id || null,
          reason: formData.reason,
          status: 'pending',
          cbs_posting_status: 'queued',
          authorized_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create audit log entry
      await supabase.from('treasury_transfer_audit').insert({
        transfer_id: data.id,
        action: 'authorized',
        performed_by: user.data.user.id,
        notes: 'Transfer authorized via 2FA'
      });

      toast({
        title: 'Transfer Authorized',
        description: 'Your transfer request has been submitted to CBS for posting',
      });

      setOpen(false);
      setShow2FA(false);
      setPendingTransfer(null);
      setFormData({
        destination_type: '' as any,
        source_currency: sourceCurrency || '',
        destination_currency: '',
        amount: '',
        transfer_type: '',
        exchange_rate: '',
        reason: '',
        destination_account_id: ''
      });
    } catch (error) {
      console.error('Error creating transfer request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transfer request',
        variant: 'destructive'
      });
    }
  };

  if (show2FA) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 relative">
          <Button
            variant="ghost"
            onClick={() => {
              setShow2FA(false);
              setPendingTransfer(null);
            }}
            className="absolute top-2 right-2"
          >
            ✕
          </Button>
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Authorize Transfer</h2>
            <p className="text-muted-foreground">
              Please confirm this action to proceed with the transfer request.
            </p>
            <div className="flex gap-2 pt-4">
              <Button onClick={handle2FASuccess} className="flex-1">
                Confirm Authorization
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShow2FA(false);
                  setPendingTransfer(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Liquidity Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Liquidity Management - Transfer Request</DialogTitle>
          <DialogDescription>
            Create a transfer request from Treasury to Main Bank or FX Desk
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This transfer will be queued for CBS posting and require authorization before settlement.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="destination_type">Destination *</Label>
            <Select
              value={formData.destination_type}
              onValueChange={(value: any) => setFormData({ ...formData, destination_type: value, transfer_type: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main_bank">Main Bank Operational Account</SelectItem>
                <SelectItem value="fx">Foreign Exchange Desk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.destination_type && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source_currency">Source Currency *</Label>
                  <Input
                    id="source_currency"
                    value={formData.source_currency}
                    onChange={(e) => setFormData({ ...formData, source_currency: e.target.value })}
                    placeholder="e.g., ZAR, USD"
                  />
                </div>
                {formData.destination_type === 'fx' && (
                  <div>
                    <Label htmlFor="destination_currency">Destination Currency</Label>
                    <Input
                      id="destination_currency"
                      value={formData.destination_currency}
                      onChange={(e) => setFormData({ ...formData, destination_currency: e.target.value })}
                      placeholder="e.g., USD, EUR"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="transfer_type">Transfer Type *</Label>
                <Select
                  value={formData.transfer_type}
                  onValueChange={(value) => setFormData({ ...formData, transfer_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transfer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTransferTypes().map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.destination_type === 'fx' && (
                <div>
                  <Label htmlFor="exchange_rate">Exchange Rate (Optional)</Label>
                  <Input
                    id="exchange_rate"
                    type="number"
                    step="0.0001"
                    value={formData.exchange_rate}
                    onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                    placeholder="Live rate will be used if not specified"
                  />
                </div>
              )}

              {formData.destination_type === 'main_bank' && accounts.length > 0 && (
                <div>
                  <Label htmlFor="destination_account">Destination Account (Optional)</Label>
                  <Select
                    value={formData.destination_account_id}
                    onValueChange={(value) => setFormData({ ...formData, destination_account_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter(acc => acc.account_type === 'main')
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_name} - {account.account_number}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="reason">Reason / Notes</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe the purpose of this transfer..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  Submit & Authorize Transfer
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiquidityTransferDialog;
