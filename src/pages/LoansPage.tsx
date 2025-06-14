
import React from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAccountNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const LoansPage = () => {
  const { isLoadingAccounts } = useAccounts();

  // Generate 20 mock loan accounts as requested
  const mockLoans = Array.from({ length: 20 }, (_, i) => ({
    id: `loan-${i}`,
    account_name: `Personal Loan ${i + 1}`,
    account_number: `620000000000${String(1000 + i).padStart(4, '0')}`,
    balance: 10000000,
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Loans</h1>
      {isLoadingAccounts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mockLoans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockLoans.map((loan) => (
            <Card key={loan.id}>
              <CardHeader>
                <CardTitle>{loan.account_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-mono">{formatAccountNumber(loan.account_number)}</p>
                <p className="text-2xl font-bold mt-4">
                  R{Number(loan.balance).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Unused Loan Amount</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>You have no loan accounts.</p>
      )}
    </div>
  );
};

export default LoansPage;
