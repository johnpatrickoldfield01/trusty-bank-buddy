import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  icon: string;
};

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <span className="text-lg">{transaction.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{transaction.name}</p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-medium",
                  transaction.amount > 0 ? "text-bank-secondary" : ""
                )}>
                  {transaction.amount > 0 ? '+' : ''}
                  R{Math.abs(transaction.amount).toFixed(2)}
                </p>
                <Badge variant="secondary" className="text-xs font-normal">
                  {transaction.category}
                </Badge>
              </div>
            </div>
          ))}
          
          <button className="w-full mt-2 text-sm text-bank-primary hover:text-bank-primary/80 font-medium py-2">
            View all transactions
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
