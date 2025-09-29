import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WalletAddress {
  id: string;
  exchange_name: string;
  cryptocurrency: string;
  wallet_address: string;
  address_label?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useWalletAddresses = () => {
  const [addresses, setAddresses] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crypto_wallet_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching wallet addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet addresses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData: {
    exchange_name: string;
    cryptocurrency: string;
    wallet_address: string;
    address_label?: string;
    is_default?: boolean;
  }) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // If this is set as default, unset all other defaults for this crypto/exchange combo
      if (addressData.is_default) {
        await supabase
          .from('crypto_wallet_addresses')
          .update({ is_default: false })
          .eq('exchange_name', addressData.exchange_name)
          .eq('cryptocurrency', addressData.cryptocurrency);
      }

      const { data, error } = await supabase
        .from('crypto_wallet_addresses')
        .insert([{ ...addressData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Wallet address added successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error adding wallet address:', error);
      toast({
        title: "Error",
        description: "Failed to add wallet address",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAddress = async (id: string, updates: Partial<WalletAddress>) => {
    try {
      // If setting as default, unset other defaults
      if (updates.is_default) {
        const address = addresses.find(a => a.id === id);
        if (address) {
          await supabase
            .from('crypto_wallet_addresses')
            .update({ is_default: false })
            .eq('exchange_name', address.exchange_name)
            .eq('cryptocurrency', address.cryptocurrency)
            .neq('id', id);
        }
      }

      const { data, error } = await supabase
        .from('crypto_wallet_addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => prev.map(addr => addr.id === id ? data : addr));
      toast({
        title: "Success",
        description: "Wallet address updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error updating wallet address:', error);
      toast({
        title: "Error",
        description: "Failed to update wallet address",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crypto_wallet_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast({
        title: "Success",
        description: "Wallet address deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting wallet address:', error);
      toast({
        title: "Error",
        description: "Failed to delete wallet address",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getAddressesForExchangeAndCrypto = (exchange: string, crypto: string) => {
    return addresses.filter(
      addr => addr.exchange_name === exchange && addr.cryptocurrency === crypto
    );
  };

  const getDefaultAddress = (exchange: string, crypto: string) => {
    return addresses.find(
      addr => addr.exchange_name === exchange && 
              addr.cryptocurrency === crypto && 
              addr.is_default
    );
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return {
    addresses,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    getAddressesForExchangeAndCrypto,
    getDefaultAddress,
    refetch: fetchAddresses
  };
};