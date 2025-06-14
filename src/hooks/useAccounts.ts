
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
        const outdatedMainAccounts = accounts.filter(
          (acc) =>
            acc.account_type === 'main' &&
            acc.account_number &&
            acc.account_number.replace(/\D/g, '').length < 16
        );

        if (outdatedMainAccounts.length > 0) {
          Promise.all(
            outdatedMainAccounts.map((account) =>
              supabase
                .from('accounts')
                .update({ account_number: '1234567890123456' })
                .eq('id', account.id)
            )
          ).then((results) => {
            const hasError = results.some((res) => res.error);
            if (!hasError) {
              queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
            } else {
              results.forEach((res) => {
                if (res.error) {
                  console.error('Failed to update account number:', res.error.message);
                }
              });
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
