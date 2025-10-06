import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownToLine, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ReceiveCryptoDialogProps {
  crypto: {
    name: string;
    symbol: string;
    price: number;
  };
  onTransactionReceived: () => void;
}

const ReceiveCryptoDialog = ({ crypto, onTransactionReceived }: ReceiveCryptoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Luno receiving addresses (you can manage these in a database table)
  const lunoAddresses = {
    BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Replace with actual Luno BTC address
    ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // Replace with actual Luno ETH address
  };

  const receivingAddress = lunoAddresses[crypto.symbol as keyof typeof lunoAddresses] || 'Address not configured';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(receivingAddress);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackTransaction = async () => {
    if (!txHash.trim()) {
      toast.error('Please enter a transaction hash');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error('Please log in to track transactions');
        return;
      }

      // Determine network
      const network = crypto.symbol === 'BTC' ? 'bitcoin' : 'ethereum';

      // Call sync-blockchain-tx to fetch and save transaction data
      const { data, error } = await supabase.functions.invoke('sync-blockchain-tx', {
        body: {
          txHash: txHash.trim(),
          network: network,
          userId: userData.user.id
        }
      });

      if (error) {
        console.error('Blockchain sync error:', error);
        toast.error('Failed to sync transaction from blockchain', {
          description: error.message || 'Could not fetch transaction data from blockchain explorer'
        });
        return;
      }

      if (data?.success) {
        toast.success('Transaction tracked successfully!', {
          description: `${crypto.symbol} transaction synced from blockchain and added to your portfolio`
        });
        
        // Refresh the parent component
        onTransactionReceived();
        
        // Close dialog
        setOpen(false);
        setTxHash('');
      } else {
        toast.error('Transaction sync failed', {
          description: 'Unable to verify transaction on blockchain'
        });
      }

    } catch (error) {
      console.error('Track transaction error:', error);
      toast.error('Failed to track transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowDownToLine className="h-4 w-4" />
          Receive {crypto.symbol}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive {crypto.name} to Luno</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Receiving Address */}
          <div className="space-y-2">
            <Label>Your Luno {crypto.symbol} Receiving Address</Label>
            <div className="flex gap-2">
              <Input
                value={receivingAddress}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyAddress}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Send {crypto.symbol} to this address from any exchange or wallet
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Track Incoming Transaction</h4>
            <p className="text-sm text-muted-foreground mb-4">
              After sending {crypto.symbol} to your Luno address, enter the transaction hash below to track it:
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="txHash">Transaction Hash (TxID)</Label>
                <Input
                  id="txHash"
                  placeholder={`Enter ${crypto.symbol} transaction hash...`}
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  disabled={isProcessing}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Find this in your sending wallet's transaction history
                </p>
              </div>

              <Button
                onClick={handleTrackTransaction}
                disabled={isProcessing || !txHash.trim()}
                className="w-full"
              >
                {isProcessing ? 'Syncing from Blockchain...' : 'Track & Sync Transaction'}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>How it works:</strong><br />
              1. Copy your Luno receiving address<br />
              2. Send {crypto.symbol} from another wallet/exchange to this address<br />
              3. Wait for blockchain confirmation (5-30 minutes)<br />
              4. Enter the transaction hash here to sync it to your portfolio<br />
              5. Transaction will appear in your Luno balance once confirmed
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveCryptoDialog;
