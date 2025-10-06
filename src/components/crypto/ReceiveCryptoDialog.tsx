import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownToLine, Copy, Check, Save, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';

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
  const [receivingAddress, setReceivingAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [showSaveAddress, setShowSaveAddress] = useState(false);

  const { addresses, saveAddress, deleteAddress, setDefault } = useSavedAddresses('Luno', crypto.symbol);

  // Load default address or first saved address
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      setReceivingAddress(defaultAddr.wallet_address);
      setAddressLabel(defaultAddr.address_label || '');
    }
  }, [addresses]);

  const handleCopyAddress = () => {
    if (!receivingAddress) {
      toast.error('No address configured');
      return;
    }
    navigator.clipboard.writeText(receivingAddress);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAddress = () => {
    if (!receivingAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    saveAddress({
      exchange_name: 'Luno',
      cryptocurrency: crypto.symbol,
      wallet_address: receivingAddress.trim(),
      address_label: addressLabel.trim() || null,
      is_default: addresses.length === 0, // First address is default
    });

    setShowSaveAddress(false);
  };

  const handleSelectSavedAddress = (addressId: string) => {
    const addr = addresses.find(a => a.id === addressId);
    if (addr) {
      setReceivingAddress(addr.wallet_address);
      setAddressLabel(addr.address_label || '');
    }
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
          {/* Saved Addresses Selector */}
          {addresses.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Luno Addresses</Label>
              <Select onValueChange={handleSelectSavedAddress}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a saved address" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((addr) => (
                    <SelectItem key={addr.id} value={addr.id}>
                      <div className="flex items-center gap-2">
                        {addr.is_default && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                        <span className="font-mono text-xs">{addr.wallet_address.substring(0, 20)}...</span>
                        {addr.address_label && <span className="text-xs text-muted-foreground">({addr.address_label})</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Receiving Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Your Luno {crypto.symbol} Receiving Address</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveAddress(!showSaveAddress)}
              >
                <Save className="h-3 w-3 mr-1" />
                Save New
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={receivingAddress}
                onChange={(e) => setReceivingAddress(e.target.value)}
                placeholder="Enter your Luno address"
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyAddress}
                disabled={!receivingAddress}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            {showSaveAddress && (
              <div className="space-y-2 pt-2 border-t">
                <Input
                  placeholder="Address label (optional)"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveAddress} size="sm" className="flex-1">
                    Save Address
                  </Button>
                  <Button variant="outline" onClick={() => setShowSaveAddress(false)} size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

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
