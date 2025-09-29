import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceError {
  id: string;
  errorCode: string;
  errorMessage: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'database' | 'compliance' | 'api' | 'regulatory';
  description: string;
  resolution: string;
  baasRequest?: string;
  timeoutCode?: number;
  lastOccurred: string;
  affectedTransfers: number;
}

interface ComplianceEmailSenderProps {
  selectedErrors: ComplianceError[];
  className?: string;
}

const ComplianceEmailSender = ({ selectedErrors, className }: ComplianceEmailSenderProps) => {
  const [bankEmail, setBankEmail] = useState('care@fnb.co.za');
  const [ccEmail, setCcEmail] = useState('oldfieldjohnpatrick@gmail.com');
  const [accountNumber, setAccountNumber] = useState('63155335110');
  const [clid, setClid] = useState('3024485');
  const [supportNumber, setSupportNumber] = useState('8271850');
  const [techRef, setTechRef] = useState('B9-101-L-L20250929134553');
  const [transferAmounts, setTransferAmounts] = useState('10000, 10000');
  const [currentBalance, setCurrentBalance] = useState('100');
  const [expectedBalance, setExpectedBalance] = useState('20100');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (selectedErrors.length === 0) {
      toast.error('Please select at least one compliance error to report');
      return;
    }

    if (!bankEmail || !ccEmail) {
      toast.error('Please provide both bank email and CC email addresses');
      return;
    }

    setIsSending(true);

    try {
      const amounts = transferAmounts.split(',').map(amt => parseFloat(amt.trim()));
      
      const { data, error } = await supabase.functions.invoke('send-bank-compliance-email', {
        body: {
          bankEmail,
          ccEmail,
          selectedErrors,
          transferDetails: {
            amounts,
            accountNumber,
            clid,
            supportNumber,
            techRef,
            currentBalance: parseFloat(currentBalance),
            expectedBalance: parseFloat(expectedBalance)
          }
        }
      });

      if (error) {
        console.error('Error sending compliance email:', error);
        toast.error('Failed to send compliance email');
        return;
      }

      toast.success(`Compliance email sent successfully to ${bankEmail} with CC to ${ccEmail}`);
      
    } catch (error) {
      console.error('Error sending compliance email:', error);
      toast.error('Failed to send compliance email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Compliance Email to Bank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankEmail">Bank Email</Label>
            <Input
              id="bankEmail"
              type="email"
              value={bankEmail}
              onChange={(e) => setBankEmail(e.target.value)}
              placeholder="care@fnb.co.za"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ccEmail">CC Email (Your Email)</Label>
            <Input
              id="ccEmail"
              type="email"
              value={ccEmail}
              onChange={(e) => setCcEmail(e.target.value)}
              placeholder="your.email@gmail.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="63155335110"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clid">CLID</Label>
            <Input
              id="clid"
              value={clid}
              onChange={(e) => setClid(e.target.value)}
              placeholder="3024485"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supportNumber">Support Number</Label>
            <Input
              id="supportNumber"
              value={supportNumber}
              onChange={(e) => setSupportNumber(e.target.value)}
              placeholder="8271850"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="techRef">Tech Reference</Label>
            <Input
              id="techRef"
              value={techRef}
              onChange={(e) => setTechRef(e.target.value)}
              placeholder="B9-101-L-L20250929134553"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transferAmounts">Transfer Amounts (comma separated)</Label>
            <Input
              id="transferAmounts"
              value={transferAmounts}
              onChange={(e) => setTransferAmounts(e.target.value)}
              placeholder="10000, 10000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentBalance">Current Balance (R)</Label>
            <Input
              id="currentBalance"
              type="number"
              step="0.01"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedBalance">Expected Balance (R)</Label>
            <Input
              id="expectedBalance"
              type="number"
              step="0.01"
              value={expectedBalance}
              onChange={(e) => setExpectedBalance(e.target.value)}
              placeholder="20100"
            />
          </div>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Selected Errors:</strong> {selectedErrors.length}
          </p>
          {selectedErrors.length > 0 && (
            <div className="space-y-1">
              {selectedErrors.slice(0, 3).map((error) => (
                <p key={error.id} className="text-sm">
                  • {error.errorCode}: {error.errorMessage}
                </p>
              ))}
              {selectedErrors.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  ...and {selectedErrors.length - 3} more errors
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleSendEmail}
          disabled={isSending || selectedErrors.length === 0}
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Sending Email...' : 'Send Compliance Email to Bank'}
        </Button>

        {selectedErrors.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Please select compliance errors from the error tracker above to send an email.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceEmailSender;