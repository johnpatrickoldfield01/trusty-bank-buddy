
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { useSendCrypto } from '@/hooks/useSendCrypto';

interface SendCryptoDialogProps {
  crypto: {
    name: string;
    symbol: string;
    price: number;
  };
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const SendCryptoDialog = ({ crypto, balance, onBalanceUpdate }: SendCryptoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [selectedExchange, setSelectedExchange] = useState('coinbase');
  const [isLoading, setIsLoading] = useState(false);
  const { sendCrypto } = useSendCrypto();

  const exchanges = [
    { value: 'coinbase', label: 'Coinbase Pro', description: 'Professional trading platform' },
    { value: 'binance', label: 'Binance', description: 'Global crypto exchange' },
    { value: 'kraken', label: 'Kraken', description: 'Secure crypto platform' },
    { value: 'gemini', label: 'Gemini', description: 'Regulated exchange' },
    { value: 'bitfinex', label: 'Bitfinex', description: 'Advanced trading features' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (sendAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter a valid address');
      return;
    }

    if (!selectedExchange) {
      toast.error('Please select an exchange');
      return;
    }

    setIsLoading(true);
    
    try {
      await sendCrypto({
        crypto,
        amount: sendAmount,
        toAddress: address,
        fromBalance: balance,
        exchange: selectedExchange,
        onSuccess: (newBalance) => {
          onBalanceUpdate(newBalance);
          setOpen(false);
          setAmount('');
          setAddress('');
          setSelectedExchange('coinbase');
        }
      });
    } catch (error) {
      console.error('Send crypto error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const usdValue = parseFloat(amount || '0') * crypto.price;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Send className="h-4 w-4" />
          Send {crypto.symbol}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Send {crypto.name}
            <Badge variant="secondary">{crypto.symbol}</Badge>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="exchange">Exchange</Label>
            <Select value={selectedExchange} onValueChange={setSelectedExchange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select exchange" />
              </SelectTrigger>
              <SelectContent>
                {exchanges.map((exchange) => (
                  <SelectItem key={exchange.value} value={exchange.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{exchange.label}</span>
                      <span className="text-xs text-muted-foreground">{exchange.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Available: {balance.toLocaleString()} {crypto.symbol}
            </p>
            {amount && (
              <p className="text-sm text-muted-foreground">
                ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="address">Recipient Address</Label>
            <Input
              id="address"
              placeholder="Enter cryptocurrency address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !amount || !address || !selectedExchange}
              className="flex-1"
            >
              {isLoading ? 'Sending...' : `Send via ${exchanges.find(e => e.value === selectedExchange)?.label}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendCryptoDialog;
