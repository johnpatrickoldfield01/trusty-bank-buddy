
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { type Profile } from '@/components/layout/AppLayout';
import TransactionList from '@/components/dashboard/TransactionList';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useStatementDownloader } from '@/hooks/useStatementDownloader';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentsPage = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();
  const { transactions, isLoadingTransactions } = useTransactions(20);
  const { accounts, isLoadingAccounts } = useAccounts();
  const { downloadStatement } = useStatementDownloader();

  const handleDownloadStatement = (months: 3 | 12) => {
    const mainAccount = accounts?.find(acc => acc.account_type === 'main');
    if (profile && mainAccount) {
      downloadStatement(profile, mainAccount, months);
    }
  };

  const isLoading = isLoadingTransactions || isLoadingAccounts;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Payments & Transactions</h1>
      <div className="w-full">
            {isLoading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <TransactionList
                transactions={transactions || []}
                onDownloadStatement={() => handleDownloadStatement(3)}
                onDownload12MonthStatement={() => handleDownloadStatement(12)}
              />
            )}
      </div>
    </div>
  );
};

export default PaymentsPage;

