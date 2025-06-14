
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AccountSummary from '@/components/dashboard/AccountSummary';
import TransactionList from '@/components/dashboard/TransactionList';
import QuickActions from '@/components/dashboard/QuickActions';
import StatCard from '@/components/ui/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { WalletCards, Coins, CreditCard } from 'lucide-react';

const Index = () => {
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
              value="$400,000"
              trend={{ value: "3.2% this month", positive: true }}
              icon={<WalletCards className="h-5 w-5" />}
            />
            <StatCard
              title="Spending this month"
              value="$3,402.50"
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
            <QuickActions />
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TransactionList />
            </div>
            <div>
              <AccountSummary />
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
