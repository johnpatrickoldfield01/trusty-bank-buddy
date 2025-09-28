import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';

interface PayFastPaymentProcessorProps {
  selectedBeneficiaries: any[];
  scheduleData?: {
    amount_per_beneficiary: number;
    schedule_name: string;
    currency?: string;
  };
  onPaymentComplete?: () => void;
}

const PayFastPaymentProcessor = ({ 
  selectedBeneficiaries, 
  scheduleData, 
  onPaymentComplete 
}: PayFastPaymentProcessorProps) => {
  const { user } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');

  const processSinglePayment = async (beneficiary: any) => {
    if (!scheduleData || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('payfast-payment', {
        body: {
          action: 'single-payment',
          beneficiaryId: beneficiary.id,
          amount: scheduleData.amount_per_beneficiary,
          currency: scheduleData.currency || 'ZAR',
          description: `Payment from ${scheduleData.schedule_name}`,
          reference: `PAY-${Date.now()}-${beneficiary.id.substring(0, 8)}`,
          userEmail: user.email
        }
      });

      if (error) throw error;

      if (data.success) {
        // Open PayFast payment page in new window
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;
        form.target = '_blank';

        // Add all payment data as hidden fields
        Object.entries(data.paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        toast.success(`Payment initiated for ${beneficiary.beneficiary_name}`);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('PayFast payment error:', error);
      toast.error(`Payment failed for ${beneficiary.beneficiary_name}: ${error.message}`);
      return false;
    }
  };

  const processBulkPayments = async () => {
    if (!scheduleData || !user?.email) return;

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const beneficiaryIds = selectedBeneficiaries.map(b => b.id);
      
      const { data, error } = await supabase.functions.invoke('payfast-payment', {
        body: {
          action: 'bulk-payment',
          beneficiaryIds,
          amountPerBeneficiary: scheduleData.amount_per_beneficiary,
          currency: scheduleData.currency || 'ZAR',
          description: `Bulk payment from ${scheduleData.schedule_name}`,
          userEmail: user.email
        }
      });

      if (error) throw error;

      if (data.success) {
        // Process each payment individually with proper spacing
        let successCount = 0;
        
        console.log(`Opening ${data.payments.length} PayFast payment windows...`);
        
        for (let i = 0; i < data.payments.length; i++) {
          const payment = data.payments[i];
          
          // Create and submit form for each payment
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = payment.paymentUrl;
          form.target = `_payfast_${i}`; // Unique target for each window

          Object.entries(payment.paymentData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          });

          document.body.appendChild(form);
          
          // Open in new window with unique name
          window.open('', `_payfast_${i}`, 'width=800,height=600,scrollbars=yes,resizable=yes');
          form.submit();
          document.body.removeChild(form);
          
          successCount++;
          
          // Add delay between opening windows to prevent browser blocking
          if (i < data.payments.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          }
        }

        setPaymentStatus('completed');
        toast.success(`${successCount} PayFast payment windows opened. Complete each payment individually to process the full R${(scheduleData.amount_per_beneficiary * successCount).toLocaleString()} bulk payment.`);
        onPaymentComplete?.();
      }
    } catch (error: any) {
      console.error('Bulk payment error:', error);
      setPaymentStatus('error');
      toast.error(`Bulk payment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = scheduleData ? scheduleData.amount_per_beneficiary * selectedBeneficiaries.length : 0;
  const currency = scheduleData?.currency || 'ZAR';

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle>PayFast Payment Processing</CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Licensed FSP Partner
          </Badge>
        </div>
        <CardDescription>
          Process payments through PayFast - Licensed Financial Services Provider
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Beneficiaries</span>
            </div>
            <p className="text-2xl font-bold">{selectedBeneficiaries.length}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Amount</span>
            </div>
            <p className="text-2xl font-bold">{currency} {totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Important - Complete ALL Payments:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>{selectedBeneficiaries.length} payment windows</strong> will open (one for each beneficiary)</li>
            <li>• <strong>Complete each payment individually</strong> - don't close windows until done</li>
            <li>• <strong>Total amount: {currency} {totalAmount.toLocaleString()}</strong> ({selectedBeneficiaries.length} × {currency} {scheduleData?.amount_per_beneficiary.toLocaleString()})</li>
            <li>• Each payment processes separately through PayFast</li>
            <li>• Use test card: 4000000000000002 (CVV: 123)</li>
          </ul>
        </div>

        {paymentStatus === 'idle' && (
          <div className="space-y-2">
            <Button 
              onClick={processBulkPayments}
              disabled={isProcessing || selectedBeneficiaries.length === 0}
              className="w-full"
              size="lg"
            >
              {isProcessing ? 'Opening Payment Windows...' : `Process ALL ${selectedBeneficiaries.length} Payments (${currency} ${totalAmount.toLocaleString()}) via PayFast`}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              <strong>⚠️ Important:</strong> {selectedBeneficiaries.length} separate payment windows will open. Complete each one to process the full {currency} {totalAmount.toLocaleString()} amount.
            </p>
          </div>
        )}

        {paymentStatus === 'processing' && (
          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800">Opening PayFast payment windows...</span>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="text-green-800">
              <div className="font-medium">{selectedBeneficiaries.length} payment windows opened successfully!</div>
              <div className="text-sm">Complete each payment window to process the full {currency} {totalAmount.toLocaleString()} amount.</div>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">Payment processing failed. Please try again.</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>PayFast Benefits:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• Licensed Financial Services Provider</li>
            <li>• Bank-approved payment processing</li>
            <li>• Full regulatory compliance</li>
            <li>• Secure payment handling</li>
            <li>• Real-time payment notifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayFastPaymentProcessor;