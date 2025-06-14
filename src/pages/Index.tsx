
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

const Index = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const queryClient = useQueryClient();

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
        const { error } = await supabase.from('accounts').insert([
          { user_id: user.id, account_type: 'main', account_name: 'Main Account', balance: 10000000, account_number: '**** **** **** 1234' },
          { user_id: user.id, account_type: 'savings', account_name: 'Savings Account', balance: 500000, account_number: '**** **** **** 5678' },
          { user_id: user.id, account_type: 'credit', account_name: 'Credit Card', balance: 1000000, account_number: '**** **** **** 9012' }
        ]);
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

  const mainAccountBalance = mainAccount?.balance ?? 0;
  const savingsBalance = savingsAccount?.balance ?? 0;
  const creditCardBalance = creditAccount?.balance ?? 0;
  const creditCardLimit = 1792952.54; 

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
              <TransactionList transactions={transactions || []} />
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
