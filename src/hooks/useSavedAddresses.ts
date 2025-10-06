import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema for crypto addresses
const addressSchema = z.object({
  exchange_name: z.string().min(1, 'Exchange name is required').max(50),
  cryptocurrency: z.string().min(1, 'Cryptocurrency is required').max(10),
  wallet_address: z.string()
    .min(26, 'Address too short')
    .max(100, 'Address too long')
    .regex(/^[a-zA-Z0-9]+$/, 'Invalid address format'),
  address_label: z.string().max(100).optional(),
  is_default: z.boolean().default(false),
});

export type SavedAddress = {
  id: string;
  user_id: string;
  exchange_name: string;
  cryptocurrency: string;
  wallet_address: string;
  address_label: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export const useSavedAddresses = (exchange?: string, crypto?: string) => {
  const queryClient = useQueryClient();

  // Fetch saved addresses
  const { data: addresses, isLoading, error } = useQuery({
    queryKey: ['saved-addresses', exchange, crypto],
    queryFn: async () => {
      let query = supabase
        .from('saved_crypto_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (exchange) {
        query = query.eq('exchange_name', exchange);
      }
      if (crypto) {
        query = query.eq('cryptocurrency', crypto);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SavedAddress[];
    },
  });

  // Save new address
  const saveAddress = useMutation({
    mutationFn: async (newAddress: Omit<SavedAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      // Validate input
      const validatedData = addressSchema.parse(newAddress);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Not authenticated');

      // If setting as default, unset other defaults first
      if (validatedData.is_default) {
        await supabase
          .from('saved_crypto_addresses')
          .update({ is_default: false })
          .eq('user_id', userData.user.id)
          .eq('exchange_name', validatedData.exchange_name)
          .eq('cryptocurrency', validatedData.cryptocurrency);
      }

      const { data, error } = await supabase
        .from('saved_crypto_addresses')
        .insert([{
          exchange_name: validatedData.exchange_name,
          cryptocurrency: validatedData.cryptocurrency,
          wallet_address: validatedData.wallet_address,
          address_label: validatedData.address_label,
          is_default: validatedData.is_default,
          user_id: userData.user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-addresses'] });
      toast.success('Address saved successfully');
    },
    onError: (error: any) => {
      console.error('Failed to save address:', error);
      toast.error('Failed to save address', {
        description: error.message,
      });
    },
  });

  // Update address
  const updateAddress = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SavedAddress> }) => {
      const { data, error } = await supabase
        .from('saved_crypto_addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-addresses'] });
      toast.success('Address updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update address:', error);
      toast.error('Failed to update address');
    },
  });

  // Delete address
  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_crypto_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-addresses'] });
      toast.success('Address deleted successfully');
    },
    onError: (error: any) => {
      console.error('Failed to delete address:', error);
      toast.error('Failed to delete address');
    },
  });

  // Set address as default
  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      const address = addresses?.find(a => a.id === id);
      if (!address) throw new Error('Address not found');

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Not authenticated');

      // Unset other defaults
      await supabase
        .from('saved_crypto_addresses')
        .update({ is_default: false })
        .eq('user_id', userData.user.id)
        .eq('exchange_name', address.exchange_name)
        .eq('cryptocurrency', address.cryptocurrency);

      // Set new default
      const { error } = await supabase
        .from('saved_crypto_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-addresses'] });
      toast.success('Default address updated');
    },
    onError: (error: any) => {
      console.error('Failed to set default:', error);
      toast.error('Failed to set default address');
    },
  });

  return {
    addresses: addresses || [],
    isLoading,
    error,
    saveAddress: saveAddress.mutate,
    updateAddress: updateAddress.mutate,
    deleteAddress: deleteAddress.mutate,
    setDefault: setDefault.mutate,
  };
};
