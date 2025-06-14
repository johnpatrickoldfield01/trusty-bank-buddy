
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wallet, CreditCard, PiggyBank, Landmark } from 'lucide-react';

interface AccountSummaryProps {
  mainAccountBalance: number;
  savingsBalance: number;
  creditCardBalance: number;
  creditCardLimit: number;
  loanBalance: number;
  mainAccountNumber?: string;
  savingsAccountNumber?: string;
  creditCardAccountNumber?: string;
  loanAccountNumber?: string;
}

const AccountSummary = ({ mainAccountBalance, savingsBalance, creditCardBalance, creditCardLimit, loanBalance, mainAccountNumber, savingsAccountNumber, creditCardAccountNumber, loanAccountNumber }: AccountSummaryProps) => {
  const creditUsagePercentage = creditCardBalance < 0 ? (Math.abs(creditCardBalance) / creditCardLimit) * 100 : 0;
  const monthlyRepayment = loanBalance * 0.0001;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Account Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Account */}
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-primary/20 mr-3">
              <Wallet className="h-5 w-5 text-bank-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium">Main Account</p>
                <p className="font-bold">R{mainAccountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              {mainAccountNumber && <p className="text-xs text-muted-foreground">{mainAccountNumber}</p>}
            </div>
          </div>

          {/* Savings Account */}
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-secondary/20 mr-3">
              <PiggyBank className="h-5 w-5 text-bank-secondary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium">Savings</p>
                <p className="font-bold">R{savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              {savingsAccountNumber && <p className="text-xs text-muted-foreground">{savingsAccountNumber}</p>}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-muted-foreground">Savings Goal</span>
                  <span>58%</span>
                </div>
                <Progress value={58} className="h-1.5" />
              </div>
            </div>
          </div>

          {/* Credit Card */}
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-accent/20 mr-3">
              <CreditCard className="h-5 w-5 text-bank-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium">Credit Card</p>
                <p className={`font-bold ${creditCardBalance < 0 ? 'text-destructive' : ''}`}>R{creditCardBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              {creditCardAccountNumber && <p className="text-xs text-muted-foreground">{creditCardAccountNumber}</p>}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-muted-foreground">Credit Limit</span>
                  <span>{creditUsagePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={creditUsagePercentage} className={`h-1.5 ${creditCardBalance < 0 ? 'bg-red-200' : 'bg-secondary'}`} />
                <p className="text-xs text-muted-foreground text-right mt-1">Limit: R{creditCardLimit.toLocaleString('en-US')}</p>
              </div>
            </div>
          </div>

          {/* Loan Account */}
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 mr-3">
              <Landmark className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium">Business Loan</p>
                <p className="font-bold">R{loanBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              {loanAccountNumber && <p className="text-xs text-muted-foreground">{loanAccountNumber}</p>}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-muted-foreground">Monthly Repayment (0.01%)</span>
                  <span>R{monthlyRepayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">30 years remaining</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSummary;
