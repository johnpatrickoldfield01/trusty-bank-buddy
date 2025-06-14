
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  icon: string;
};

const TransactionList = ({ transactions, onDownloadStatement, onDownload12MonthStatement }: { transactions: Transaction[], onDownloadStatement: () => void, onDownload12MonthStatement: () => void }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.map((transaction) => (
            <Link key={transaction.id} to={`/transaction/${transaction.id}`} className="block p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
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
            </Link>
          ))}
          
          <div className="w-full mt-4 pt-4 border-t flex justify-center items-center gap-4 flex-wrap">
            <Button variant="link" className="text-bank-primary">
              View all transactions
            </Button>
            <Button variant="outline" onClick={onDownloadStatement}>
              <Download className="mr-2 h-4 w-4" />
              Statement (3 mo)
            </Button>
            <Button variant="outline" onClick={onDownload12MonthStatement}>
              <Download className="mr-2 h-4 w-4" />
              Statement (12 mo)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
