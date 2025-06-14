
import React from 'react';
import { useParams, Link as RouterLink, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Banknote, Calendar, User, Landmark, Hash, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type Profile } from '@/components/layout/AppLayout';
import { useProofOfPaymentDownloader, type TransactionWithAccountDetails } from '@/hooks/useProofOfPaymentDownloader';

const TransactionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useOutletContext<{ profile: Profile }>();
  const { downloadProofOfPayment } = useProofOfPaymentDownloader();

  const { data: transaction, isLoading, error } = useQuery<TransactionWithAccountDetails | null>({
    queryKey: ['transaction', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts (
            account_name,
            account_number,
            account_type
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
  });

  const renderDetailItem = (icon: React.ReactNode, label: string, value: string | React.ReactNode) => (
    <div className="flex items-start gap-4">
      <div className="text-muted-foreground mt-1">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <Button asChild variant="outline" className="mb-6" disabled>
            <RouterLink to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</RouterLink>
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3 mt-2" />
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Transaction not found</h2>
        <p className="text-muted-foreground mb-4">The transaction you are looking for does not exist or could not be loaded.</p>
        <Button asChild>
            <RouterLink to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</RouterLink>
        </Button>
      </div>
    );
  }

  const isDeposit = transaction.amount > 0;
  const account = transaction.accounts;

  return (
    <div className="container py-8 animate-fade-in">
        <Button asChild variant="outline" className="mb-6">
            <RouterLink to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</RouterLink>
        </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl">{transaction.name}</CardTitle>
              <CardDescription>
                {format(new Date(transaction.transaction_date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => downloadProofOfPayment(profile, transaction)}
              className="flex-shrink-0"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6 border-r-0 md:border-r pr-0 md:pr-8">
                <h3 className="text-lg font-semibold border-b pb-2">Transaction Details</h3>
                {renderDetailItem(<Banknote className="h-5 w-5" />, 'Amount', 
                  <span className={cn(isDeposit ? 'text-green-600' : 'text-red-600')}>
                    {isDeposit ? '+' : '-'} R{Math.abs(transaction.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                {renderDetailItem(<User className="h-5 w-5" />, 'Category', transaction.category || 'Uncategorized')}
                {renderDetailItem(<Hash className="h-5 w-5" />, 'Transaction ID', transaction.id)}
                 {account && renderDetailItem(<Landmark className="h-5 w-5" />, 'Account', 
                    <span>{account.account_name} ({account.account_number})</span>
                )}
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">{isDeposit ? 'Sender Details' : 'Recipient Details'}</h3>
                {renderDetailItem(<User className="h-5 w-5" />, 'Name', isDeposit ? 'External Employer Co.' : transaction.name.replace('Transfer to ', ''))}
                {renderDetailItem(<Landmark className="h-5 w-5" />, 'Bank', 'Other Bank Inc.')}
                {renderDetailItem(<Hash className="h-5 w-5" />, 'Account Number', '**** **** **** 3456')}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDetailsPage;
