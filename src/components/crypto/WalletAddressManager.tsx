import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Plus, Trash2, Edit3, Star } from 'lucide-react';
import { useWalletAddresses, WalletAddress } from '@/hooks/useWalletAddresses';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface WalletAddressManagerProps {
  currentExchange?: string;
  currentCrypto?: string;
}

const WalletAddressManager = ({ currentExchange, currentCrypto }: WalletAddressManagerProps) => {
  const [open, setOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<WalletAddress | null>(null);
  const { addresses, loading, addAddress, updateAddress, deleteAddress } = useWalletAddresses();

  // Form states
  const [formData, setFormData] = useState({
    exchange_name: currentExchange || 'luno',
    cryptocurrency: currentCrypto || 'BTC',
    wallet_address: '',
    address_label: '',
    is_default: false
  });

  const exchanges = [
    { value: 'luno', label: 'Luno' },
    { value: 'coinbase', label: 'Coinbase Pro' },
    { value: 'binance', label: 'Binance' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'bitfinex', label: 'Bitfinex' },
  ];

  const cryptocurrencies = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'ADA', label: 'Cardano (ADA)' },
    { value: 'SOL', label: 'Solana (SOL)' },
    { value: 'DOGE', label: 'Dogecoin (DOGE)' },
  ];

  const resetForm = () => {
    setFormData({
      exchange_name: currentExchange || 'luno',
      cryptocurrency: currentCrypto || 'BTC',
      wallet_address: '',
      address_label: '',
      is_default: false
    });
    setEditingAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.wallet_address.trim()) {
      return;
    }

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
      } else {
        await addAddress(formData);
      }
      
      resetForm();
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEdit = (address: WalletAddress) => {
    setFormData({
      exchange_name: address.exchange_name,
      cryptocurrency: address.cryptocurrency,
      wallet_address: address.wallet_address,
      address_label: address.address_label || '',
      is_default: address.is_default
    });
    setEditingAddress(address);
    setAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
  };

  const toggleDefault = async (address: WalletAddress) => {
    await updateAddress(address.id, { is_default: !address.is_default });
  };

  const groupedAddresses = addresses.reduce((acc, address) => {
    const key = `${address.exchange_name}-${address.cryptocurrency}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(address);
    return acc;
  }, {} as Record<string, WalletAddress[]>);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Wallet className="h-4 w-4" />
            Manage Addresses ({addresses.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Wallet Address Manager</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Manage your saved cryptocurrency wallet addresses for quick sending
              </p>
              <Button 
                onClick={() => {
                  resetForm();
                  setAddDialogOpen(true);
                }}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Address
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading addresses...</div>
            ) : Object.keys(groupedAddresses).length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No wallet addresses saved yet</p>
                <p className="text-sm text-muted-foreground">Add addresses to send crypto quickly</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedAddresses).map(([key, addressList]) => {
                  const [exchange, crypto] = key.split('-');
                  const exchangeLabel = exchanges.find(e => e.value === exchange)?.label || exchange;
                  
                  return (
                    <Card key={key}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {exchangeLabel} - {crypto}
                          <Badge variant="secondary">{addressList.length} address{addressList.length > 1 ? 'es' : ''}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {addressList.map((address) => (
                          <div key={address.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">
                                  {address.address_label || 'Unnamed Address'}
                                </p>
                                {address.is_default && (
                                  <Badge variant="default" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-mono truncate">
                                {address.wallet_address}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleDefault(address)}
                                title={address.is_default ? "Remove as default" : "Set as default"}
                              >
                                <Star className={`h-4 w-4 ${address.is_default ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(address)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Address</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this wallet address? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(address.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Address Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit' : 'Add'} Wallet Address
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="exchange">Exchange</Label>
              <Select 
                value={formData.exchange_name} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, exchange_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exchanges.map(exchange => (
                    <SelectItem key={exchange.value} value={exchange.value}>
                      {exchange.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cryptocurrency">Cryptocurrency</Label>
              <Select 
                value={formData.cryptocurrency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cryptocurrency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cryptocurrencies.map(crypto => (
                    <SelectItem key={crypto.value} value={crypto.value}>
                      {crypto.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="wallet_address">Wallet Address</Label>
              <Input
                id="wallet_address"
                placeholder="Enter wallet address"
                value={formData.wallet_address}
                onChange={(e) => setFormData(prev => ({ ...prev, wallet_address: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="address_label">Label (Optional)</Label>
              <Input
                id="address_label"
                placeholder="e.g., Personal Wallet, Trading Account"
                value={formData.address_label}
                onChange={(e) => setFormData(prev => ({ ...prev, address_label: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
              />
              <Label htmlFor="is_default" className="text-sm">
                Set as default address for this exchange/crypto
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setAddDialogOpen(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingAddress ? 'Update' : 'Add'} Address
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletAddressManager;