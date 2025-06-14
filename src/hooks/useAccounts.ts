
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { useAccountInitializer } from './useAccountInitializer';

export const useAccounts = () => {
  const { user } = useSession();
  const { initializeAccounts, addHomeLoanAccount } = useAccountInitializer();
  const queryClient = useQueryClient();

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
        const mainAccount = accounts.find(acc => acc.account_type === 'main');
        if (mainAccount && mainAccount.account_number && mainAccount.account_number.length < 16) {
          supabase
            .from('accounts')
            .update({ account_number: '1234567890123456' })
            .eq('id', mainAccount.id)
            .then(({ error }) => {
              if (!error) {
                queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
              }
            });
        }
        
        const hasHomeLoan = accounts.some(acc => acc.account_name === 'Home Loan');
        if (!hasHomeLoan) {
          addHomeLoanAccount(user);
        }
      }
    }
  }, [user, accounts, isSuccess, initializeAccounts, addHomeLoanAccount, queryClient]);

  return { accounts, isLoadingAccounts };
};
