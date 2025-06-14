
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AccountSummary from '@/components/dashboard/AccountSummary';
import TransactionList, { Transaction } from '@/components/dashboard/TransactionList';
import QuickActions from '@/components/dashboard/QuickActions';
import StatCard from '@/components/ui/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { WalletCards, Coins, CreditCard } from 'lucide-react';

const initialTransactions: Transaction[] = [
    {
      id: '1',
      name: 'Starbucks Coffee',
      amount: -12.50,
      date: 'Today, 9:15 AM',
      category: 'Food',
      icon: '🍔',
    },
    {
      id: '2',
      name: 'Amazon Purchase',
      amount: -89.99,
      date: 'Yesterday, 2:30 PM',
      category: 'Shopping',
      icon: '🛍️',
    },
    {
      id: '3',
      name: 'Salary Deposit',
      amount: 3240.00,
      date: 'Apr 28, 2025',
      category: 'Income',
      icon: '💰',
    },
    {
      id: '4',
      name: 'Electric Bill',
      amount: -124.50,
      date: 'Apr 27, 2025',
      category: 'Utilities',
      icon: '⚡',
    },
    {
      id: '5',
      name: 'Netflix Subscription',
      amount: -15.99,
      date: 'Apr 26, 2025',
      category: 'Entertainment',
      icon: '🎬',
    },
  ];

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [totalBalance, setTotalBalance] = useState(400000);
  const [spendingThisMonth, setSpendingThisMonth] = useState(3402.50);
  const [mainAccountBalance, setMainAccountBalance] = useState(12458.32);

  const handleSendMoney = ({ amount, recipientName }: { amount: number; recipientName: string }) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedDate = `Today, ${formattedHours}:${formattedMinutes} ${ampm}`;
    
    const newTransaction: Transaction = {
      id: now.toISOString(),
      name: `Transfer to ${recipientName}`,
      amount: -amount,
      date: formattedDate,
      category: 'Transfer',
      icon: '💸',
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setTotalBalance(prev => prev - amount);
    setMainAccountBalance(prev => prev - amount);
    setSpendingThisMonth(prev => prev + amount);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">Welcome, Alex!</h1>
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Balance"
              value={`$${totalBalance.toLocaleString('en-US')}`}
              trend={{ value: "3.2% this month", positive: true }}
              icon={<WalletCards className="h-5 w-5" />}
            />
            <StatCard
              title="Spending this month"
              value={`$${spendingThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              trend={{ value: "12% more than last month", positive: false }}
              icon={<CreditCard className="h-5 w-5" />}
            />
            <StatCard
              title="Saved this month"
              value="$850.00"
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
              <TransactionList transactions={transactions} />
            </div>
            <div>
              <AccountSummary mainAccountBalance={mainAccountBalance} />
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
