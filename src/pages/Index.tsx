
import React from 'react';
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

  // Using static values for balances as requested.
  const mainAccountBalance = 10000000;
  const savingsBalance = 500000;
  const creditCardBalance = 1000000;
  const creditCardLimit = 1792952.54; 

  const totalBalance = mainAccountBalance + savingsBalance;
  const spendingThisMonth = 61008.20;

  const handleSendMoney = async ({ amount, recipientName }: { amount: number; recipientName: string }) => {
    if (!user) {
        toast.error("You must be logged in to send money.");
        throw new Error("User not logged in.");
    }
    
    const { data: accounts, error: fetchError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

    if (fetchError || !accounts) {
        toast.error("Could not fetch account details.");
        throw fetchError || new Error("No accounts found");
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
            <AccountSummary
              mainAccountBalance={mainAccountBalance}
              savingsBalance={savingsBalance}
              creditCardBalance={creditCardBalance}
              creditCardLimit={creditCardLimit}
            />
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
