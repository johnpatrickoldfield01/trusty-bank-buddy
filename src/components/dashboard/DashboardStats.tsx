
import React from 'react';
import StatCard from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WalletCards, Coins, CreditCard } from 'lucide-react';
import { useCurrencyLocation } from '@/hooks/useCurrencyLocation';

interface DashboardStatsProps {
  isLoading: boolean;
  totalBalance: number;
  spendingThisMonth: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ isLoading, totalBalance, spendingThisMonth }) => {
  const { formatCurrency, currentCurrency } = useCurrencyLocation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {isLoading ? (
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
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </>
      ) : (
        <>
          <StatCard
            title="Total Balance"
            value={formatCurrency(totalBalance)}
            trend={{ value: "3.2% this month", positive: true }}
            icon={<WalletCards className="h-5 w-5" />}
          />
          <StatCard
            title="Spending this month"
            value={formatCurrency(spendingThisMonth)}
            trend={{ value: "12% more than last month", positive: false }}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatCard
            title="Saved this month"
            value={formatCurrency(15240)}
            trend={{ value: "5.3% this month", positive: true }}
            icon={<Coins className="h-5 w-5" />}
          />
        </>
      )}
    </div>
  );
};

export default DashboardStats;
