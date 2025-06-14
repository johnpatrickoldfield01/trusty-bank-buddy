import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { useAccountInitializer } from './useAccountInitializer';

export const useAccounts = () => {
  const { user } = useSession();
  const { initializeAccounts, addHomeLoanAccount } = useAccountInitializer();

  const { data: accounts, isLoading: isLoadingAccounts, isSuccess } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('accounts').select('*').eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user && isSuccess && accounts) {
      if (accounts.length === 0) {
        initializeAccounts(user);
      } else {
        const hasHomeLoan = accounts.some(acc => acc.account_name === 'Home Loan');
        if (!hasHomeLoan) {
          addHomeLoanAccount(user);
        }
      }
    }
  }, [user, accounts, isSuccess, initializeAccounts, addHomeLoanAccount]);

  return { accounts, isLoadingAccounts };
};
