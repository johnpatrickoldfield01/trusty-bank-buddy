
import React from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAccountNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const LoansPage = () => {
  const { accounts, isLoadingAccounts } = useAccounts();

  const loanAccount = accounts?.find(acc => acc.account_name === 'Home Loan');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Loans</h1>
      {isLoadingAccounts ? (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
      ) : loanAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>{loanAccount.account_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Account Number</p>
            <p className="font-mono">{formatAccountNumber(loanAccount.account_number)}</p>
            <p className="text-2xl font-bold mt-4">
              ${Number(loanAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">Current Balance</p>
          </CardContent>
        </Card>
      ) : (
        <p>You have no loan accounts.</p>
      )}
    </div>
  );
};

export default LoansPage;
