
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type PaymentProcessorProps = {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
};

const PaymentProcessor = ({ cardNumber, cardHolder, expiryDate, cvv }: PaymentProcessorProps) => {
  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handlePayment = async () => {
    if (!amount || !merchantName) {
      toast.error('Please fill in all fields');
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);

    try {
      // Create a Stripe checkout session for real payment
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: Math.round(paymentAmount * 100), // Convert to cents
          currency: 'usd',
          merchantName,
          cardDetails: {
            cardNumber,
            cardHolder,
            expiryDate,
            cvv
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.open(data.url, '_blank');
        toast.success(`Payment of $${amount} initiated for ${merchantName}`);
        setIsOpen(false);
        setAmount('');
        setMerchantName('');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4" variant="default">
          <CreditCard className="mr-2 h-4 w-4" />
          Use Card for Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Make Payment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Using Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm font-mono">{cardNumber}</p>
              <p className="text-sm text-muted-foreground">{cardHolder}</p>
              <p className="text-sm text-muted-foreground">Expires: {expiryDate}</p>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant/Service</Label>
            <Input
              id="merchant"
              placeholder="e.g., Netflix, Amazon, etc."
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handlePayment} 
            disabled={isProcessing || !amount || !merchantName}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : `Pay $${amount || '0.00'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentProcessor;
