import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TransferRequest {
  id: string;
  source_type: string;
  destination_type: string;
  source_currency: string;
  destination_currency: string | null;
  amount: number;
  transfer_type: string;
  exchange_rate: number | null;
  status: string;
  cbs_posting_status: string;
  reason: string | null;
  created_at: string;
  authorized_at: string | null;
  destination_account_id: string | null;
}

const PendingPostingsView = () => {
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [validationNotes, setValidationNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingTransfers();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('treasury-transfers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'treasury_transfer_requests'
        },
        () => {
          fetchPendingTransfers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('treasury_transfer_requests')
        .select('*')
        .in('cbs_posting_status', ['queued', 'validated'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateTransfer = async (transferId: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('treasury_transfer_requests')
        .update({
          cbs_posting_status: 'validated',
          status: 'approved'
        })
        .eq('id', transferId);

      if (error) throw error;

      await supabase.from('treasury_transfer_audit').insert({
        transfer_id: transferId,
        action: 'validated',
        performed_by: user.data.user.id,
        notes: validationNotes
      });

      toast({
        title: 'Transfer Validated',
        description: 'Transfer has been validated and is ready for posting'
      });

      setSelectedTransfer(null);
      setValidationNotes('');
      fetchPendingTransfers();
    } catch (error) {
      console.error('Error validating transfer:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate transfer',
        variant: 'destructive'
      });
    }
  };

  const postTransfer = async (transfer: TransferRequest) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Update transfer status
      const { error: transferError } = await supabase
        .from('treasury_transfer_requests')
        .update({
          cbs_posting_status: 'posted',
          status: 'posted',
          posted_at: new Date().toISOString()
        })
        .eq('id', transfer.id);

      if (transferError) throw transferError;

      // Execute the actual transfer based on destination type
      if (transfer.destination_type === 'main_bank' && transfer.destination_account_id) {
        // Get current balance
        const { data: accountData } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transfer.destination_account_id)
          .single();

        if (accountData) {
          // Credit the main bank account
          const newBalance = Number(accountData.balance) + Number(transfer.amount);
          const { error: accountError } = await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', transfer.destination_account_id);

          if (accountError) {
            console.error('Account update error:', accountError);
          }

          // Create transaction record
          await supabase.from('transactions').insert({
            account_id: transfer.destination_account_id,
            name: `Treasury ${transfer.transfer_type}`,
            amount: transfer.amount,
            category: 'Treasury Transfer',
            icon: '🏦'
          });
        }
      } else if (transfer.destination_type === 'fx') {
        // Update FX holdings - this would integrate with your FX system
        console.log('FX transfer posted:', transfer);
      }

      // Create audit log
      await supabase.from('treasury_transfer_audit').insert({
        transfer_id: transfer.id,
        action: 'posted',
        performed_by: user.data.user.id,
        notes: 'Transfer posted successfully to CBS'
      });

      toast({
        title: 'Transfer Posted',
        description: 'Transfer has been posted to the ledger successfully'
      });

      fetchPendingTransfers();
    } catch (error) {
      console.error('Error posting transfer:', error);
      toast({
        title: 'Error',
        description: 'Failed to post transfer',
        variant: 'destructive'
      });
    }
  };

  const rejectTransfer = async (transferId: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('treasury_transfer_requests')
        .update({
          cbs_posting_status: 'failed',
          status: 'rejected'
        })
        .eq('id', transferId);

      if (error) throw error;

      await supabase.from('treasury_transfer_audit').insert({
        transfer_id: transferId,
        action: 'rejected',
        performed_by: user.data.user.id,
        notes: validationNotes
      });

      toast({
        title: 'Transfer Rejected',
        description: 'Transfer has been rejected',
        variant: 'destructive'
      });

      setSelectedTransfer(null);
      setValidationNotes('');
      fetchPendingTransfers();
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject transfer',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'queued':
        return <Badge variant="secondary">Queued</Badge>;
      case 'validated':
        return <Badge className="bg-blue-100 text-blue-800">Validated</Badge>;
      case 'posted':
        return <Badge className="bg-green-100 text-green-800">Posted</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransferTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      internal_liquidity: 'Internal Liquidity',
      capital_injection: 'Capital Injection',
      fx_allocation: 'FX Allocation',
      fx_spot: 'FX Spot',
      fx_forward: 'FX Forward',
      fx_swap: 'FX Swap'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading pending postings...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Treasury Postings</CardTitle>
          <CardDescription>
            Review and approve treasury liquidity transfers pending CBS posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending transfers
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source → Destination</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transfer Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div className="font-medium">
                        {transfer.source_type} → {transfer.destination_type}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transfer.source_currency}
                      {transfer.destination_currency && transfer.destination_currency !== transfer.source_currency && (
                        <> → {transfer.destination_currency}</>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      {transfer.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getTransferTypeLabel(transfer.transfer_type)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transfer.cbs_posting_status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(transfer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedTransfer(transfer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {transfer.cbs_posting_status === 'queued' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => validateTransfer(transfer.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => rejectTransfer(transfer.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        {transfer.cbs_posting_status === 'validated' && (
                          <Button
                            size="sm"
                            onClick={() => postTransfer(transfer)}
                          >
                            Post
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedTransfer && (
        <Dialog open={!!selectedTransfer} onOpenChange={() => setSelectedTransfer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Details</DialogTitle>
              <DialogDescription>
                Review transfer information and add validation notes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Source:</span> {selectedTransfer.source_type}
                </div>
                <div>
                  <span className="font-medium">Destination:</span> {selectedTransfer.destination_type}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> {selectedTransfer.amount.toLocaleString()} {selectedTransfer.source_currency}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {getTransferTypeLabel(selectedTransfer.transfer_type)}
                </div>
                {selectedTransfer.exchange_rate && (
                  <div className="col-span-2">
                    <span className="font-medium">Exchange Rate:</span> {selectedTransfer.exchange_rate}
                  </div>
                )}
                {selectedTransfer.reason && (
                  <div className="col-span-2">
                    <span className="font-medium">Reason:</span> {selectedTransfer.reason}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="validation_notes">Validation Notes</Label>
                <Textarea
                  id="validation_notes"
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Add notes about this validation..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {selectedTransfer.cbs_posting_status === 'queued' && (
                  <>
                    <Button onClick={() => validateTransfer(selectedTransfer.id)} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Validate
                    </Button>
                    <Button variant="destructive" onClick={() => rejectTransfer(selectedTransfer.id)} className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedTransfer.cbs_posting_status === 'validated' && (
                  <Button onClick={() => postTransfer(selectedTransfer)} className="flex-1">
                    Post to Ledger
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PendingPostingsView;
