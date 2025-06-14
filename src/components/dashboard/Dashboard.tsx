
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import AccountSummary from '@/components/dashboard/AccountSummary';
import TransactionList from '@/components/dashboard/TransactionList';
import QuickActions from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Profile } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatementDownloader } from '@/hooks/useStatementDownloader';
import { useAccountConfirmationDownloader } from '@/hooks/useAccountConfirmationDownloader';

import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useMonthlySpending } from '@/hooks/useMonthlySpending';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import PremiumCardOffer from '@/components/dashboard/PremiumCardOffer';
import { useCashflowForecastDownloader } from '@/hooks/useCashflowForecastDownloader';
import { useBalanceSheetDownloader } from '@/hooks/useBalanceSheetDownloader';
import { type LocalTransferFormValues } from '@/schemas/localTransferSchema';

interface DashboardProps {
    profile: Profile | null;
}

const Dashboard = ({ profile }: DashboardProps) => {
  const navigate = useNavigate();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { downloadStatement } = useStatementDownloader();
  const { downloadCashflowForecast } = useCashflowForecastDownloader();
  const { downloadBalanceSheet } = useBalanceSheetDownloader();
  const { downloadAccountConfirmation } = useAccountConfirmationDownloader();

  const { accounts, isLoadingAccounts } = useAccounts();
  const { transactions, isLoadingTransactions } = useTransactions();
  const { spendingThisMonth, isLoadingSpending } = useMonthlySpending();
  
  const mainAccount = accounts?.find(acc => acc.account_type === 'main');
  const savingsAccount = accounts?.find(acc => acc.account_type === 'savings');
  const creditAccount = accounts?.find(acc => acc.account_type === 'credit');
  const businessLoanAccount = accounts?.find(acc => acc.account_name === 'Business Loan');
  const homeLoanAccount = accounts?.find(acc => acc.account_name === 'Home Loan');

  const mainAccountBalance = mainAccount?.balance ?? 0;
  const savingsBalance = savingsAccount?.balance ?? 0;
  const creditCardBalance = creditAccount?.balance ?? 0;
  const creditCardLimit = 10000; 
  const businessLoanBalance = businessLoanAccount?.balance ?? 0;
  const homeLoanBalance = homeLoanAccount?.balance ?? 0;

  const mainAccountNumber = mainAccount?.account_number;
  const savingsAccountNumber = savingsAccount?.account_number;
  const creditCardAccountNumber = creditAccount?.account_number;
  const businessLoanAccountNumber = businessLoanAccount?.account_number;
  const homeLoanAccountNumber = homeLoanAccount?.account_number;

  const totalBalance = mainAccountBalance + savingsBalance;

  const handleSendMoney = async ({ amount, recipientName }: { amount: number; recipientName: string }) => {
    if (!user) {
        toast.error("You must be logged in to send money.");
        throw new Error("User not logged in.");
    }
    
    if (!accounts) {
        toast.error("Could not fetch account details.");
        throw new Error("No accounts found");
    }

    const mainAccount = accounts.find(acc => acc.account_type === 'main');

    if (!mainAccount) {
      toast.error("Main account not found.");
      throw new Error("Main account not found.");
    }
    if (mainAccount.balance < amount) {
        toast.error("Insufficient funds.");
        throw new Error("Insufficient funds.");
    }

    const { error } = await supabase.rpc('transfer_money', {
      sender_account_id: mainAccount.id,
      recipient_name: recipientName,
      transfer_amount: amount
    });

    if (error) {
      toast.error(`Transaction failed: ${error.message}`);
      throw error;
    }

    await queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['monthlySpending', user?.id] });
  };

  const handleLocalTransfer = async (values: LocalTransferFormValues) => {
    if (!user) {
        toast.error("You must be logged in to send money.");
        throw new Error("User not logged in.");
    }
    
    if (!accounts) {
        toast.error("Could not fetch account details.");
        throw new Error("No accounts found");
    }

    const mainAccount = accounts.find(acc => acc.account_type === 'main');

    if (!mainAccount) {
      toast.error("Main account not found.");
      throw new Error("Main account not found.");
    }
    if (mainAccount.balance < values.amount) {
        toast.error("Insufficient funds.");
        throw new Error("Insufficient funds.");
    }

    const { error } = await supabase.rpc('transfer_money', {
      sender_account_id: mainAccount.id,
      recipient_name: values.accountHolderName,
      transfer_amount: values.amount
    });

    if (error) {
      toast.error(`Transaction failed: ${error.message}`);
      throw error;
    }

    await queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['monthlySpending', user?.id] });
  };

  const handleDownloadStatement = () => {
    const mainAccount = accounts?.find(acc => acc.account_type === 'main');
    downloadStatement(profile, mainAccount, 3);
  };

  const handleDownload12MonthStatement = () => {
    const mainAccount = accounts?.find(acc => acc.account_type === 'main');
    downloadStatement(profile, mainAccount, 12);
  };

  const handleDownloadCashflowForecast = () => {
    downloadCashflowForecast(profile, totalBalance);
  };

  const handleDownloadBalanceSheet = () => {
    const balanceSheetData = {
      assets: [
        { name: 'Main Account', balance: mainAccountBalance },
        { name: 'Savings Account', balance: savingsBalance },
      ],
      liabilities: [
        { name: 'Credit Card', balance: creditCardBalance },
        { name: 'Business Loan', balance: businessLoanBalance },
        { name: 'Home Loan', balance: homeLoanBalance },
      ],
    };
    downloadBalanceSheet(profile, balanceSheetData);
  };

  const handleDownloadConfirmation = () => {
    downloadAccountConfirmation(profile, mainAccount);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div>
      <div className="container py-8">
        <DashboardHeader profile={profile} onLogout={handleLogout} />
        
        <DashboardStats
          isLoading={isLoadingAccounts || isLoadingSpending}
          totalBalance={totalBalance}
          spendingThisMonth={spendingThisMonth ?? 0}
        />
        
        <div className="mb-6">
          <QuickActions onSendMoney={handleSendMoney} onDownloadCashflowForecast={handleDownloadCashflowForecast} onDownloadBalanceSheet={handleDownloadBalanceSheet} onLocalTransfer={handleLocalTransfer} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoadingTransactions ? (
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
                transactions={transactions || []}
                onDownloadStatement={handleDownloadStatement}
                onDownload12MonthStatement={handleDownload12MonthStatement}
              />
            )}
          </div>
          <div>
            {isLoadingAccounts ? (
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
                mainAccountBalance={mainAccountBalance}
                savingsBalance={savingsBalance}
                creditCardBalance={creditCardBalance}
                creditCardLimit={creditCardLimit}
                loanBalance={businessLoanBalance}
                homeLoanBalance={homeLoanBalance}
                mainAccountNumber={mainAccountNumber}
                savingsAccountNumber={savingsAccountNumber}
                creditCardAccountNumber={creditCardAccountNumber}
                loanAccountNumber={businessLoanAccountNumber}
                homeLoanAccountNumber={homeLoanAccountNumber}
                onDownloadConfirmation={handleDownloadConfirmation}
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
