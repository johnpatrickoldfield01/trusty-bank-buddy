
import React, { useEffect } from 'react';
import AccountSummary from '@/components/dashboard/AccountSummary';
import TransactionList from '@/components/dashboard/TransactionList';
import QuickActions from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Profile } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import PremiumCardOffer from '@/components/dashboard/PremiumCardOffer';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardActions } from '@/hooks/useDashboardActions';

interface DashboardProps {
    profile: Profile | null;
}

const Dashboard = ({ profile }: DashboardProps) => {
  const data = useDashboardData();
  const actions = useDashboardActions({ profile, ...data });

  // Force refresh accounts on component mount to ensure latest data
  useEffect(() => {
    if (data.refreshAccounts) {
      data.refreshAccounts();
    }
  }, []);

  return (
    <div>
      <div className="container py-8">
        <DashboardHeader profile={profile} onLogout={actions.handleLogout} />
        
        <DashboardStats
          isLoading={data.isLoadingAccounts || data.isLoadingSpending}
          totalBalance={data.totalBalance}
          spendingThisMonth={data.spendingThisMonth ?? 0}
        />
        
        <div className="mb-6">
          <QuickActions
            onSendMoney={actions.handleSendMoney}
            onDownloadCashflowForecast={actions.handleDownloadCashflowForecast}
            onDownloadBalanceSheet={actions.handleDownloadBalanceSheet}
            onLocalTransfer={actions.handleLocalTransfer}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {data.isLoadingTransactions ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(5)].map((_, i) => (
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
                transactions={data.transactions || []}
                onDownloadStatement={actions.handleDownloadStatement}
                onDownload12MonthStatement={actions.handleDownload12MonthStatement}
              />
            )}
          </div>
          <div>
            {data.isLoadingAccounts ? (
              <Card>
                <CardHeader><CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/4" /></div></div>
                  <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/4" /></div></div>
                  <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/4" /></div></div>
                </CardContent>
              </Card>
            ) : (
              <AccountSummary
                mainAccountBalance={data.mainAccountBalance}
                savingsBalance={data.savingsBalance}
                creditCardBalance={data.creditCardBalance}
                creditCardLimit={data.creditCardLimit}
                loanBalance={data.businessLoanBalance}
                homeLoanBalance={data.homeLoanBalance}
                mainAccountNumber={data.mainAccountNumber}
                savingsAccountNumber={data.savingsAccountNumber}
                creditCardAccountNumber={data.creditCardAccountNumber}
                loanAccountNumber={data.businessLoanAccountNumber}
                homeLoanAccountNumber={data.homeLoanAccountNumber}
                onDownloadConfirmation={actions.handleDownloadConfirmation}
              />
            )}
          </div>
        </div>
        
        <PremiumCardOffer />
      </div>
    </div>
  );
};

export default Dashboard;
