
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, Wallet, PiggyBank, TrendingUp } from 'lucide-react';
import SendMoneyDialog from './SendMoneyDialog';

interface QuickActionsProps {
  onSendMoney: (data: { amount: number; recipientName: string }) => Promise<void>;
  onDownloadCashflowForecast: () => void;
}

const QuickActions = ({ onSendMoney, onDownloadCashflowForecast }: QuickActionsProps) => {
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => setIsSendMoneyOpen(true)}
            >
              <div className="h-8 w-8 rounded-full bg-bank-primary/20 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-bank-primary" />
              </div>
              <span className="text-xs font-normal">Send</span>
            </Button>

            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <div className="h-8 w-8 rounded-full bg-bank-accent/20 flex items-center justify-center">
                <ArrowDownLeft className="h-4 w-4 text-bank-accent" />
              </div>
              <span className="text-xs font-normal">Request</span>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <div className="h-8 w-8 rounded-full bg-bank-secondary/20 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-bank-secondary" />
              </div>
              <span className="text-xs font-normal">Top Up</span>
            </Button>
            
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-xs font-normal">Save</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={onDownloadCashflowForecast}
            >
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-xs font-normal">Forecast</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <SendMoneyDialog isOpen={isSendMoneyOpen} onOpenChange={setIsSendMoneyOpen} onSendMoney={onSendMoney} />
    </>
  );
};

export default QuickActions;
