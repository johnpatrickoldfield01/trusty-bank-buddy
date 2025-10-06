import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Mock FNB balance sync for testing/development
 * Simulates the sync-fnb-balance edge function without requiring real API credentials
 */
export const useMockFnbSync = () => {
  const [isLoading, setIsLoading] = useState(false);

  const syncMockBalance = async (accountId: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock balance (random between R1,000 and R50,000)
      const mockBalance = (Math.random() * 49000 + 1000).toFixed(2);

      // Update the account balance in Supabase
      const { error } = await supabase
        .from('accounts')
        .update({ balance: parseFloat(mockBalance) })
        .eq('id', accountId);

      if (error) {
        console.error('Mock sync error:', error);
        toast.error('Failed to update balance');
        return { success: false, error };
      }

      toast.success(`Balance synced: R${mockBalance}`);
      return { success: true, balance: mockBalance };
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Sync failed');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncMockBalance,
    isLoading,
  };
};
