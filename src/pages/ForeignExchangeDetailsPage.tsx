import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockTransactions = [
  { id: '1', date: '2024-01-15', type: 'Buy', amount: 50000, rate: 18.45, zarAmount: 922500, reference: 'FX001' },
  { id: '2', date: '2024-01-14', type: 'Sell', amount: 25000, rate: 18.42, zarAmount: 460500, reference: 'FX002' },
  { id: '3', date: '2024-01-12', type: 'Buy', amount: 30000, rate: 18.38, zarAmount: 551400, reference: 'FX003' },
  { id: '4', date: '2024-01-10', type: 'Sell', amount: 15000, rate: 18.40, zarAmount: 276000, reference: 'FX004' },
  { id: '5', date: '2024-01-08', type: 'Buy', amount: 40000, rate: 18.35, zarAmount: 734000, reference: 'FX005' },
];

const mockPriceHistory = [
  { date: '2024-01-01', rate: 18.20 },
  { date: '2024-01-02', rate: 18.25 },
  { date: '2024-01-03', rate: 18.30 },
  { date: '2024-01-04', rate: 18.28 },
  { date: '2024-01-05', rate: 18.35 },
  { date: '2024-01-06', rate: 18.32 },
  { date: '2024-01-07', rate: 18.38 },
  { date: '2024-01-08', rate: 18.35 },
  { date: '2024-01-09', rate: 18.40 },
  { date: '2024-01-10', rate: 18.42 },
  { date: '2024-01-11', rate: 18.38 },
  { date: '2024-01-12', rate: 18.45 },
  { date: '2024-01-13', rate: 18.43 },
  { date: '2024-01-14', rate: 18.47 },
  { date: '2024-01-15', rate: 18.50 },
];

const currencyData: { [key: string]: { name: string; symbol: string; currentRate: number; change24h: number } } = {
  USD: { name: 'US Dollar', symbol: '$', currentRate: 18.50, change24h: 0.27 },
  EUR: { name: 'Euro', symbol: '€', currentRate: 20.00, change24h: -0.15 },
  GBP: { name: 'British Pound', symbol: '£', currentRate: 23.50, change24h: 0.42 },
  JPY: { name: 'Japanese Yen', symbol: '¥', currentRate: 0.12, change24h: -0.003 },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', currentRate: 13.50, change24h: 0.18 },
  AUD: { name: 'Australian Dollar', symbol: 'A$', currentRate: 12.20, change24h: -0.08 },
  CHF: { name: 'Swiss Franc', symbol: 'CHF', currentRate: 20.50, change24h: 0.35 },
  CNY: { name: 'Chinese Yuan', symbol: '¥', currentRate: 2.55, change24h: -0.02 },
};

const ForeignExchangeDetailsPage = () => {
  const { currency } = useParams<{ currency: string }>();
  const navigate = useNavigate();
  const [transactions] = useState(mockTransactions);

  if (!currency || !currencyData[currency]) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="text-center py-10">
            <h2 className="text-2xl font-bold">Currency Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested currency could not be found.</p>
            <Button onClick={() => navigate('/foreign-exchange')} className="mt-4">
              Back to Foreign Exchange
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currencyInfo = currencyData[currency];
  const isPositive = currencyInfo.change24h > 0;

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/foreign-exchange')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{currencyInfo.name} ({currency})</h1>
          <p className="text-muted-foreground">Foreign exchange details and transaction history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                R {currencyInfo.currentRate.toFixed(2)}
              </div>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{currencyInfo.change24h.toFixed(2)} (24h)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                1 {currency} = R {currencyInfo.currentRate.toFixed(2)} ZAR
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {currencyInfo.symbol}1,000,000
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ R {(1000000 * currencyInfo.currentRate).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Current value in ZAR
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {transactions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                This month
              </div>
              <div className="text-xs text-muted-foreground">
                Total volume: R {transactions.reduce((sum, t) => sum + t.zarAmount, 0).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exchange Rate History (15 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockPriceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
                tickFormatter={(value) => `R${value.toFixed(2)}`}
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`R${Number(value).toFixed(2)}`, 'Exchange Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${transaction.type === 'Buy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="font-medium">
                      {transaction.type} {currencyInfo.symbol}{transaction.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.date} • Rate: R{transaction.rate.toFixed(2)} • Ref: {transaction.reference}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    R {transaction.zarAmount.toLocaleString()}
                  </div>
                  <div className={`text-sm ${transaction.type === 'Buy' ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.type === 'Buy' ? '-' : '+'}R {transaction.zarAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForeignExchangeDetailsPage;