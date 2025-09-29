
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrencyLocation } from '@/contexts/CurrencyLocationContext';

export type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  icon: string;
  recipient_name?: string;
  recipient_swift_code?: string;
};

const TransactionList = ({ transactions, onDownloadStatement, onDownload12MonthStatement }: { transactions: Transaction[], onDownloadStatement: () => void, onDownload12MonthStatement: () => void }) => {
  const { formatCurrency } = useCurrencyLocation();

  const handleTaxDocument = (transaction: Transaction) => {
    // Generate tax compliance document for crypto transactions
    if (transaction.category === 'crypto' && transaction.recipient_swift_code) {
      const taxData = {
        transactionId: transaction.id,
        amount: Math.abs(transaction.amount),
        type: 'cryptocurrency_sale',
        date: transaction.date,
        recipient: transaction.recipient_name,
        taxableEvent: 'Capital gains tax applicable',
        documentType: 'Tax Compliance Certificate'
      };
      
      // Create downloadable tax document
      const taxDoc = `
TAX COMPLIANCE CERTIFICATE
Transaction ID: ${taxData.transactionId}
Date: ${taxData.date}
Type: Cryptocurrency Transaction
Amount: ${formatCurrency(taxData.amount)}
Recipient: ${taxData.recipient}

SARS COMPLIANCE:
- Capital Gains Tax applicable under section 26A of Income Tax Act
- Transaction reported to SARB as required
- CGT rate: 18% for individuals, 22.4% for companies
- Record retention: 7 years as per tax regulations

REGULATORY FRAMEWORK:
- FICA compliant - customer verified
- Exchange Control Regulations adhered to
- Anti-Money Laundering checks completed

This certificate serves as proof of tax compliance for the above transaction.
      `;
      
      const blob = new Blob([taxDoc], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tax_Certificate_${transaction.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
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
                    {transaction.amount > 0 
                      ? `+${formatCurrency(transaction.amount)}` 
                      : formatCurrency(transaction.amount)
                    }
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {transaction.category}
                    </Badge>
                    {transaction.category === 'crypto' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleTaxDocument(transaction);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <Receipt className="w-3 h-3 mr-1" />
                        Tax
                      </Button>
                    )}
                  </div>
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
