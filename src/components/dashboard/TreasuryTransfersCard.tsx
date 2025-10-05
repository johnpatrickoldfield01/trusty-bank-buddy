import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TreasuryTransfer {
  id: string;
  source_type: string;
  destination_type: string;
  amount: number;
  source_currency: string;
  status: string;
  cbs_posting_status: string;
  created_at: string;
}

const TreasuryTransfersCard = () => {
  const [transfers, setTransfers] = useState<TreasuryTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentTransfers();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('treasury-transfers-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'treasury_transfer_requests'
        },
        () => {
          fetchRecentTransfers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('treasury_transfer_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'settled':
        return <Badge className="bg-green-100 text-green-800">Settled</Badge>;
      case 'posted':
        return <Badge className="bg-blue-100 text-blue-800">Posted</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-purple-100 text-purple-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Recent Treasury Transfers
            </CardTitle>
            <CardDescription>
              Liquidity movements from Treasury to Main Bank/FX
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecentTransfers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No recent treasury transfers
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {transfer.source_type} → {transfer.destination_type}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {transfer.source_currency} {transfer.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(transfer.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {getStatusBadge(transfer.status)}
                  <Badge variant="outline" className="text-xs">
                    CBS: {transfer.cbs_posting_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TreasuryTransfersCard;
