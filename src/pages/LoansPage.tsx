
import React from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAccountNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAccountInitializer } from '@/hooks/useAccountInitializer';
import { useSession } from '@/hooks/useSession';
import { Link } from 'react-router-dom';

const LoansPage = () => {
  const { accounts, isLoadingAccounts } = useAccounts();
  const { addBusinessLoans } = useAccountInitializer();
  const { user } = useSession();

  const loanAccounts = accounts?.filter((acc) => acc.account_type === 'loan') || [];
  const uniqueLoanAccounts = Array.from(new Map(loanAccounts.map(loan => [loan.account_name, loan])).values());

  const handleAddLoans = () => {
    if (user) {
      addBusinessLoans(user);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Loans</h1>
        <Button onClick={handleAddLoans} disabled={!user}>
          Create 20 Business Loans
        </Button>
      </div>
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
      ) : uniqueLoanAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueLoanAccounts.map((loan) => (
            <Link key={loan.id} to={`/loans/${loan.id}`} className="block rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Card className="h-full">
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
            </Link>
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
