
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { useAccountInitializer } from './useAccountInitializer';
import { toast } from 'sonner';

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
        const outdatedAccounts = accounts.filter(
          (acc) =>
            (acc.account_type === 'main' ||
              acc.account_type === 'savings' ||
              acc.account_type === 'credit') &&
            acc.account_number &&
            acc.account_number.replace(/\D/g, '').length < 16
        );

        if (outdatedAccounts.length > 0) {
          Promise.all(
            outdatedAccounts.map((account) => {
              let newAccountNumber;
              switch (account.account_type) {
                case 'main':
                  newAccountNumber = '1234567890123456';
                  break;
                case 'savings':
                  newAccountNumber = '9876543210987654';
                  break;
                case 'credit':
                  newAccountNumber = '5555666677778888';
                  break;
              }
              return supabase
                .from('accounts')
                .update({ account_number: newAccountNumber })
                .eq('id', account.id);
            })
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

        const businessLoan = accounts.find(
            (acc) =>
              acc.account_name === 'Business Loan' &&
              acc.account_number === '4321876543210987'
          );
  
        if (businessLoan && businessLoan.balance !== -10000000.00) {
            toast.info("Updating Business Loan balance...");
            supabase
              .from('accounts')
              .update({ balance: -10000000.00 })
              .eq('id', businessLoan.id)
              .then(({ error }) => {
                if (error) {
                  console.error('Failed to update Business Loan balance:', error.message);
                  toast.error('Failed to update Business Loan balance.');
                } else {
                  toast.success('Business Loan balance updated to R10,000,000.');
                  queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
                }
              });
        }
      }
    }
  }, [user, accounts, isSuccess, initializeAccounts, addHomeLoanAccount, queryClient]);

  // Force refresh function
  const refreshAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
  };

  return { accounts, isLoadingAccounts, refreshAccounts };
};
