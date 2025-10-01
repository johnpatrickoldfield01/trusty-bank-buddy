
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, Wallet, PiggyBank, TrendingUp, Download, Landmark, Globe, Users, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import SendMoneyDialog from './SendMoneyDialog';
import LocalTransferDialog from './LocalTransferDialog';
import { type LocalTransferFormValues } from '@/schemas/localTransferSchema';

interface QuickActionsProps {
  onSendMoney: (data: { amount: number; recipientName: string }) => Promise<void>;
  onDownloadCashflowForecast: () => void;
  onDownloadBalanceSheet: () => void;
  onLocalTransfer: (values: LocalTransferFormValues) => Promise<void>;
}

const QuickActions = ({ onSendMoney, onDownloadCashflowForecast, onDownloadBalanceSheet, onLocalTransfer }: QuickActionsProps) => {
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);
  const [isLocalTransferOpen, setIsLocalTransferOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={onDownloadBalanceSheet}
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Download className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs font-normal">Balance Sheet</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => setIsLocalTransferOpen(true)}
            >
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Landmark className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-xs font-normal text-center">Local Account<br/>Transfer</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
            >
              <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                <Globe className="h-4 w-4 text-teal-600" />
              </div>
              <span className="text-xs font-normal text-center">International<br/>Account Transfer</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link to="/bulk-payments">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-xs font-normal text-center">Bulk<br/>Payments</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link to="/bug-tracking">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Bug className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-xs font-normal text-center">Bug<br/>Tracking</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <SendMoneyDialog isOpen={isSendMoneyOpen} onOpenChange={setIsSendMoneyOpen} onSendMoney={onSendMoney} />
      <LocalTransferDialog isOpen={isLocalTransferOpen} onOpenChange={setIsLocalTransferOpen} onLocalTransfer={onLocalTransfer} />
    </>
  );
};

export default QuickActions;
