
import React from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAccountNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const LoansPage = () => {
  const { accounts, isLoadingAccounts } = useAccounts();

  const loanAccounts = accounts?.filter((acc) => acc.account_type === 'loan') || [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Loans</h1>
      {isLoadingAccounts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="pt-2">
                  <Skeleton className="h-8 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : loanAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loanAccounts.map((loan) => (
            <Card key={loan.id}>
              <CardHeader>
                <CardTitle>{loan.account_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-mono">{loan.account_number ? formatAccountNumber(loan.account_number) : 'N/A'}</p>
                <p className="text-2xl font-bold mt-4">
                  R{Math.abs(Number(loan.balance)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You currently do not have any loan accounts with TrustyBank.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoansPage;
