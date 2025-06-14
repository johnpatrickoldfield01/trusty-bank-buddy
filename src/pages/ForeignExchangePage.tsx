
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/ui/StatCard';
import { Landmark } from 'lucide-react';

const currencies = [
  { code: 'USD', name: 'US Dollar', balance: 1000000 },
  { code: 'EUR', name: 'Euro', balance: 1000000 },
  { code: 'JPY', name: 'Japanese Yen', balance: 1000000 },
  { code: 'GBP', name: 'British Pound', balance: 1000000 },
  { code: 'CHF', name: 'Swiss Franc', balance: 1000000 },
  { code: 'CAD', name: 'Canadian Dollar', balance: 1000000 },
  { code: 'AUD', name: 'Australian Dollar', balance: 1000000 },
  { code: 'NZD', name: 'New Zealand Dollar', balance: 1000000 },
  { code: 'CNY', name: 'Chinese Yuan', balance: 1000000 },
  { code: 'HKD', name: 'Hong Kong Dollar', balance: 1000000 },
  { code: 'SGD', name: 'Singapore Dollar', balance: 1000000 },
  { code: 'SEK', name: 'Swedish Krona', balance: 1000000 },
  { code: 'NOK', name: 'Norwegian Krone', balance: 1000000 },
  { code: 'DKK', name: 'Danish Krone', balance: 1000000 },
  { code: 'KRW', name: 'South Korean Won', balance: 1000000 },
  { code: 'INR', name: 'Indian Rupee', balance: 1000000 },
  { code: 'BRL', name: 'Brazilian Real', balance: 1000000 },
  { code: 'RUB', name: 'Russian Ruble', balance: 1000000 },
  { code: 'ZAR', name: 'South African Rand', balance: 1000000 },
  { code: 'MXN', name: 'Mexican Peso', balance: 1000000 },
];

const exchangeRatesToZAR: { [key: string]: number } = {
  USD: 18.50,
  EUR: 20.00,
  JPY: 0.12,
  GBP: 23.50,
  CHF: 20.50,
  CAD: 13.50,
  AUD: 12.20,
  NZD: 11.30,
  CNY: 2.55,
  HKD: 2.37,
  SGD: 13.70,
  SEK: 1.75,
  NOK: 1.72,
  DKK: 2.68,
  KRW: 0.013,
  INR: 0.22,
  BRL: 3.45,
  RUB: 0.21,
  ZAR: 1.00,
  MXN: 1.02,
};

const ForeignExchangePage = () => {
  const totalBalanceInZAR = currencies.reduce((total, currency) => {
    const rate = exchangeRatesToZAR[currency.code] || 0;
    return total + currency.balance * rate;
  }, 0);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <StatCard
          title="Total Foreign Exchange Balance (ZAR)"
          value={`R ${totalBalanceInZAR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Landmark className="h-6 w-6 text-muted-foreground" />}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Foreign Exchange Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((currency) => (
                <TableRow key={currency.code}>
                  <TableCell className="font-medium">{currency.code}</TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell className="text-right">{currency.balance.toLocaleString('en-US')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForeignExchangePage;
