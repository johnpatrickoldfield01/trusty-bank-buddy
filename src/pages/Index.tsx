import React, { useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

import AccountSummary from '@/components/dashboard/AccountSummary';
import TransactionList, { Transaction } from '@/components/dashboard/TransactionList';
import QuickActions from '@/components/dashboard/QuickActions';
import StatCard from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletCards, Coins, CreditCard } from 'lucide-react';
import { type Profile } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatementDownloader } from '@/hooks/useStatementDownloader';
import { type Database } from '@/integrations/supabase/types';

const Index = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { downloadStatement } = useStatementDownloader();

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('accounts').select('*').eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user && accounts && accounts.length === 0) {
      const createInitialAccounts = async () => {
        const initialAccounts: Array<Database['public']['Tables']['accounts']['Insert']> = [
          { user_id: user.id, account_type: 'main', account_name: 'Main Account', balance: 68000000, account_number: '1234 5678 9012 3456' },
          { user_id: user.id, account_type: 'savings', account_name: 'Savings Account', balance: 0, account_number: '9876 5432 1098 7654' },
          { user_id: user.id, account_type: 'credit', account_name: 'Credit Card', balance: 1000000, account_number: '5555 6666 7777 8888' },
          { user_id: user.id, account_type: 'loan', account_name: 'Business Loan', balance: 10000000, account_number: '4321 8765 4321 0987' }
        ];
        const { error } = await supabase.from('accounts').insert(initialAccounts);
        if (error) {
          toast.error('Failed to initialize your accounts. Please refresh the page.');
          console.error('Failed to create initial accounts:', error);
        } else {
          toast.success('Your accounts have been initialized!');
          queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
        }
      };
      createInitialAccounts();
    }
  }, [user, accounts, queryClient]);

  useEffect(() => {
    if (user && accounts) {
      const loanAccountExists = accounts.some(acc => acc.account_type === 'loan');
      if (accounts.length > 0 && !loanAccountExists) {
        const createLoanAccount = async () => {
          toast.info("Checking for Business Loan account...");
          const { error } = await supabase.from('accounts').insert({
            user_id: user.id,
            account_type: 'loan',
            account_name: 'Business Loan',
            balance: 10000000,
            account_number: '4321 8765 4321 0987'
          });

          if (error) {
            toast.error('Failed to create your Business Loan account.');
            console.error('Failed to create loan account:', error);
          } else {
            toast.success('Your Business Loan account has been added!');
            queryClient.invalidateQueries({ queryKey: ['accounts', user!.id] });
          }
        };
        createLoanAccount();
      }
    }
  }, [user, accounts, queryClient]);

  useEffect(() => {
    if (user && accounts && accounts.length > 0) {
      const seedTransactions = async () => {
        const mainAccount = accounts.find(acc => acc.account_type === 'main');
        if (!mainAccount) return;

        const { data: existingSeed } = await supabase
          .from('transactions')
          .select('id')
          .eq('name', 'Monthly Salary Deposit - Month 1')
          .eq('account_id', mainAccount.id)
          .limit(1);

        if (existingSeed && existingSeed.length > 0) return;

        toast.info("Setting up your account history with sample deposits...");

        const deposits = [];
        const today = new Date();
        for (let i = 1; i <= 12; i++) {
          const transactionDate = new Date(today.getFullYear(), today.getMonth() - (12 - i), 15);
          deposits.push({
            account_id: mainAccount.id,
            name: `Monthly Salary Deposit - Month ${i}`,
            amount: 1000000,
            category: 'Salary',
            icon: '💰',
            transaction_date: transactionDate.toISOString(),
          });
        }
        
        const { error: insertError } = await supabase.from('transactions').insert(deposits);

        if (insertError) {
          toast.error('Failed to seed monthly deposits.');
          console.error('Failed to seed transactions:', insertError);
        } else {
          const { error: updateError } = await supabase
            .from('accounts')
            .update({ balance: (mainAccount.balance || 0) + 12000000 })
            .eq('id', mainAccount.id);

          if (updateError) {
            toast.error('Failed to update account balance after seeding.');
          } else {
            toast.success('Successfully added 12 monthly deposits.');
            queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
          }
        }
      };

      seedTransactions();
    }
  }, [user, accounts, queryClient]);

  useEffect(() => {
    if (user && accounts && accounts.length > 0) {
      const mainAccount = accounts.find(acc => acc.account_type === 'main');
      const savingsAccount = accounts.find(acc => acc.account_type === 'savings');

      // Check for the old balance state (around 22M) to apply the update once.
      if (mainAccount && mainAccount.balance < 30000000) {
        const updateAccountBalances = async () => {
          toast.info("Updating your account balances to new values...");

          const { data: existingSeed } = await supabase
            .from('transactions')
            .select('id')
            .eq('name', 'Monthly Salary Deposit - Month 1')
            .eq('account_id', mainAccount.id)
            .limit(1);
          
          const newMainBalance = (existingSeed && existingSeed.length > 0) ? 80000000 : 68000000;
          
          const { error: mainUpdateError } = await supabase
            .from('accounts')
            .update({ balance: newMainBalance })
            .eq('id', mainAccount.id);

          if (mainUpdateError) {
            toast.error("Failed to update Main Account balance.");
            console.error('Failed to update main account:', mainUpdateError);
            return;
          }
          
          if (savingsAccount) {
            const { error: savingsUpdateError } = await supabase
              .from('accounts')
              .update({ balance: 0 })
              .eq('id', savingsAccount.id);
            if (savingsUpdateError) {
              toast.error("Failed to update Savings Account balance.");
              console.error('Failed to update savings account:', savingsUpdateError);
              return;
            }
          }

          toast.success("Account balances have been updated!");
          queryClient.invalidateQueries({ queryKey: ['accounts', user!.id] });
        };
        
        updateAccountBalances();
      }
    }
  }, [user, accounts, queryClient]);

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false }).limit(5);
      if (error) throw new Error(error.message);
      return data.map((tx): Transaction => ({
        id: tx.id,
        name: tx.name,
        amount: tx.amount,
        date: formatDistanceToNow(new Date(tx.transaction_date), { addSuffix: true }),
        category: tx.category || '',
        icon: tx.icon || '💸',
      }));
    },
    enabled: !!user,
  });

  const mainAccount = accounts?.find(acc => acc.account_type === 'main');
  const savingsAccount = accounts?.find(acc => acc.account_type === 'savings');
  const creditAccount = accounts?.find(acc => acc.account_type === 'credit');
  const loanAccount = accounts?.find(acc => acc.account_type === 'loan');

  const mainAccountBalance = mainAccount?.balance ?? 0;
  const savingsBalance = savingsAccount?.balance ?? 0;
  const creditCardBalance = creditAccount?.balance ?? 0;
  const creditCardLimit = 1792952.54; 
  const loanBalance = loanAccount?.balance ?? 0;

  const mainAccountNumber = mainAccount?.account_number;
  const savingsAccountNumber = savingsAccount?.account_number;
  const creditCardAccountNumber = creditAccount?.account_number;
  const loanAccountNumber = loanAccount?.account_number;

  const totalBalance = mainAccountBalance + savingsBalance;
  const spendingThisMonth = 61008.20;

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

    const newTransaction = {
      account_id: mainAccount.id,
      name: `Transfer to ${recipientName}`,
      amount: -amount,
      category: 'Transfer',
      icon: '💸',
    };

    const { error: txError } = await supabase.from('transactions').insert(newTransaction);
    if (txError) {
      toast.error("Failed to record transaction.");
      throw txError;
    }

    const { error: accountError } = await supabase
      .from('accounts')
      .update({ balance: mainAccount.balance - amount })
      .eq('id', mainAccount.id);
    if (accountError) {
      toast.error("Failed to update account balance in the database.");
      throw accountError;
    }

    await queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
  };

  const handleDownloadStatement = () => {
    const mainAccount = accounts?.find(acc => acc.account_type === 'main');
    downloadStatement(profile, mainAccount, 3);
  };

  const handleDownload12MonthStatement = () => {
    const mainAccount = accounts?.find(acc => acc.account_type === 'main');
    downloadStatement(profile, mainAccount, 12);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || 'User'}!</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {isLoadingAccounts ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <Skeleton className="h-4 w-24" />
                    </CardTitle>
                    <Skeleton className="h-5 w-5" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <Skeleton className="h-8 w-48" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <Skeleton className="h-3 w-32" />
                    </p>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Balance"
                value={`R${totalBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                trend={{ value: "3.2% this month", positive: true }}
                icon={<WalletCards className="h-5 w-5" />}
              />
              <StatCard
                title="Spending this month"
                value={`R${spendingThisMonth.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                trend={{ value: "12% more than last month", positive: false }}
                icon={<CreditCard className="h-5 w-5" />}
              />
              <StatCard
                title="Saved this month"
                value="R15240.00"
                trend={{ value: "5.3% this month", positive: true }}
                icon={<Coins className="h-5 w-5" />}
              />
            </>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="mb-6">
          <QuickActions onSendMoney={handleSendMoney} />
        </div>
        
        {/* Main Content */}
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
                loanBalance={loanBalance}
                mainAccountNumber={mainAccountNumber}
                savingsAccountNumber={savingsAccountNumber}
                creditCardAccountNumber={creditCardAccountNumber}
                loanAccountNumber={loanAccountNumber}
              />
            )}
          </div>
        </div>
        
        {/* Card Promotions */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-bank-primary to-bank-accent text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Premium Card Offer</h3>
                  <p className="text-white/80 max-w-md">Upgrade to our Premium Card and enjoy 2% cashback on all purchases and zero foreign transaction fees.</p>
                </div>
                <button className="bg-white text-bank-primary px-6 py-2 rounded-md font-medium hover:bg-white/90 transition-colors">
                  Learn More
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
