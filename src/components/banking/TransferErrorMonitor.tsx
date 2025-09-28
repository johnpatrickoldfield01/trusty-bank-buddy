import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TransferError {
  id: string;
  transfer_amount: number;
  error_code: string;
  error_message: string;
  error_source: string;
  fix_provisions: string;
  notification_sent: boolean;
  occurred_at: string;
  beneficiaries: {
    beneficiary_name: string;
    bank_name: string;
  };
}

const TransferErrorMonitor = () => {
  const { user } = useSession();

  const { data: transferErrors, isLoading } = useQuery({
    queryKey: ['transfer_errors', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bank_transfer_errors')
        .select(`
          *,
          beneficiaries!beneficiary_id (
            beneficiary_name,
            bank_name
          )
        `)
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!user,
  });

  const getErrorSeverity = (errorCode: string) => {
    const severityMap: Record<string, string> = {
      'ACCT_CLOSED': 'destructive',
      'INSUF_FUNDS': 'destructive',
      'INVALID_SWIFT': 'secondary',
      'DAILY_LIMIT': 'default'
    };
    return severityMap[errorCode] || 'secondary';
  };

  const getErrorIcon = (errorCode: string) => {
    if (errorCode === 'ACCT_CLOSED' || errorCode === 'INSUF_FUNDS') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading transfer error history...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="text-lg font-medium">Transfer Error Monitor</h3>
      </div>

      <div className="space-y-3">
        {transferErrors?.map((error) => (
          <Card key={error.id} className="border-l-4 border-l-destructive">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {getErrorIcon(error.error_code)}
                    <Badge variant={getErrorSeverity(error.error_code) as any}>
                      {error.error_code}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      from {error.error_source}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium">
                      R{error.transfer_amount.toLocaleString()} to {error.beneficiaries?.beneficiary_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {error.beneficiaries?.bank_name}
                    </p>
                    <p className="text-sm">{error.error_message}</p>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium text-primary mb-1">Recommended Fix:</p>
                    <p className="text-sm">{error.fix_provisions}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{format(new Date(error.occurred_at), 'MMM dd, yyyy HH:mm')}</span>
                    <div className="flex items-center gap-4">
                      {error.notification_sent && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Mail className="h-3 w-3" />
                          <span>Email sent</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>SMS sent</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="ml-4">
                  Retry Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!transferErrors || transferErrors.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transfer errors detected. All transactions are processing smoothly.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransferErrorMonitor;