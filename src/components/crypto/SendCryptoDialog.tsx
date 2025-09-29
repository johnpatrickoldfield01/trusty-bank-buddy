
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Send, Settings, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useSendCrypto } from '@/hooks/useSendCrypto';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';
import WalletAddressManager from './WalletAddressManager';

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
  const [selectedExchange, setSelectedExchange] = useState('luno');
  const [useMockTransaction, setUseMockTransaction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { sendCrypto } = useSendCrypto();
  const { addresses, getAddressesForExchangeAndCrypto, getDefaultAddress } = useWalletAddresses();

  const exchanges = [
    { value: 'luno', label: 'Luno', description: 'Your connected exchange' },
    { value: 'coinbase', label: 'Coinbase Pro', description: 'Professional trading platform' },
    { value: 'binance', label: 'Binance', description: 'Global crypto exchange' },
    { value: 'kraken', label: 'Kraken', description: 'Secure crypto platform' },
    { value: 'gemini', label: 'Gemini', description: 'Regulated exchange' },
    { value: 'bitfinex', label: 'Bitfinex', description: 'Advanced trading features' },
  ];

  // Get saved addresses for current exchange and crypto
  const savedAddresses = getAddressesForExchangeAndCrypto(selectedExchange, crypto.symbol);
  const defaultAddress = getDefaultAddress(selectedExchange, crypto.symbol);

  // Set default address when exchange changes
  useEffect(() => {
    const defaultAddr = getDefaultAddress(selectedExchange, crypto.symbol);
    if (defaultAddr && !address) {
      setAddress(defaultAddr.wallet_address);
    }
  }, [selectedExchange, crypto.symbol, getDefaultAddress, address]);

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
        mockMode: useMockTransaction,
        onSuccess: (newBalance) => {
          onBalanceUpdate(newBalance);
          setOpen(false);
          setAmount('');
          setAddress('');
          setSelectedExchange('luno');
          setUseMockTransaction(false);
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
          {/* Transaction Mode Selector */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="transaction-mode" className="text-sm font-medium">
                  Transaction Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  {useMockTransaction ? 'Test transaction (won\'t appear on blockchain)' : 'Real transaction (will appear on blockchain)'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="mock-switch" className="text-xs">Mock</Label>
                <Switch
                  id="mock-switch"
                  checked={useMockTransaction}
                  onCheckedChange={setUseMockTransaction}
                  disabled={isLoading}
                />
                <Label htmlFor="mock-switch" className="text-xs">Real</Label>
              </div>
            </div>
            {useMockTransaction && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                ⚠️ Mock mode: This transaction will not appear on public blockchain explorers
              </div>
            )}
          </div>

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
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="address">Recipient Address</Label>
              <WalletAddressManager 
                currentExchange={selectedExchange} 
                currentCrypto={crypto.symbol} 
              />
            </div>
            
            {/* Saved Addresses Quick Select */}
            {savedAddresses.length > 0 && (
              <div className="mb-2">
                <Label className="text-xs text-muted-foreground">Saved Addresses:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {savedAddresses.map((savedAddr) => (
                    <Button
                      key={savedAddr.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => setAddress(savedAddr.wallet_address)}
                      disabled={isLoading}
                    >
                      {savedAddr.is_default && <Star className="h-3 w-3 mr-1 fill-current" />}
                      {savedAddr.address_label || savedAddr.wallet_address.slice(0, 8) + '...'}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
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
