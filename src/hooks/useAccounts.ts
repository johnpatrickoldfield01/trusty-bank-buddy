
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { toast } from 'sonner';
import { type Database } from '@/integrations/supabase/types';

export const useAccounts = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
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
    if (user && accounts && accounts.length === 0) {
      const createInitialAccounts = async () => {
        const initialAccounts: Array<Database['public']['Tables']['accounts']['Insert']> = [
          { user_id: user.id, account_type: 'main', account_name: 'Main Account', balance: 68000000, account_number: '1234 5678 9012 3456' },
          { user_id: user.id, account_type: 'savings', account_name: 'Savings Account', balance: 500000, account_number: '9876 5432 1098 7654' },
          { user_id: user.id, account_type: 'credit', account_name: 'Credit Card', balance: 1000000, account_number: '5555 6666 7777 8888' },
          { user_id: user.id, account_type: 'loan', account_name: 'Business Loan', balance: 10000000, account_number: '4321 8765 4321 0987' }
        ];
        const { error } = await supabase.from('accounts').insert(initialAccounts);
        if (error) {
          toast.error('Failed to initialize your accounts. Please refresh the page.');
          console.error('Failed to create initial accounts:', error);
        } else {
          toast.success('Your accounts have been initialized!');
          queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
        }
      };
      createInitialAccounts();
    }
  }, [user, accounts, queryClient]);

  useEffect(() => {
    if (user && accounts) {
      const loanAccountExists = accounts.some(acc => acc.account_type === 'loan');
      if (accounts.length > 0 && !loanAccountExists) {
        const createLoanAccount = async () => {
          toast.info("Checking for Business Loan account...");
          const { error } = await supabase.from('accounts').insert({
            user_id: user.id,
            account_type: 'loan',
            account_name: 'Business Loan',
            balance: 10000000,
            account_number: '4321 8765 4321 0987'
          });

          if (error) {
            toast.error('Failed to create your Business Loan account.');
            console.error('Failed to create loan account:', error);
          } else {
            toast.success('Your Business Loan account has been added!');
            queryClient.invalidateQueries({ queryKey: ['accounts', user!.id] });
          }
        };
        createLoanAccount();
      }
    }
  }, [user, accounts, queryClient]);
  
  useEffect(() => {
    if (user && accounts && accounts.length > 0) {
      const seedTransactions = async () => {
        const mainAccount = accounts.find(acc => acc.account_type === 'main');
        if (!mainAccount) return;

        const { data: existingSeed } = await supabase
          .from('transactions')
          .select('id')
          .eq('name', 'Monthly Salary Deposit - Month 1')
          .eq('account_id', mainAccount.id)
          .limit(1);

        if (existingSeed && existingSeed.length > 0) return;

        toast.info("Setting up your account history with sample deposits...");

        const deposits = [];
        const today = new Date();
        for (let i = 1; i <= 12; i++) {
          const transactionDate = new Date(today.getFullYear(), today.getMonth() - (12 - i), 15);
          deposits.push({
            account_id: mainAccount.id,
            name: `Monthly Salary Deposit - Month ${i}`,
            amount: 1000000,
            category: 'Salary',
            icon: '💰',
            transaction_date: transactionDate.toISOString(),
          });
        }
        
        const { error: insertError } = await supabase.from('transactions').insert(deposits);

        if (insertError) {
          toast.error('Failed to seed monthly deposits.');
          console.error('Failed to seed transactions:', insertError);
        } else {
          const { error: updateError } = await supabase
            .from('accounts')
            .update({ balance: (mainAccount.balance || 0) + 12000000 })
            .eq('id', mainAccount.id);

          if (updateError) {
            toast.error('Failed to update account balance after seeding.');
          } else {
            toast.success('Successfully added 12 monthly deposits.');
            queryClient.invalidateQueries({ queryKey: ['accounts', user.id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
          }
        }
      };

      seedTransactions();
    }
  }, [user, accounts, queryClient]);

  useEffect(() => {
    if (user && accounts && accounts.length > 0) {
      const mainAccount = accounts.find(acc => acc.account_type === 'main');
      const savingsAccount = accounts.find(acc => acc.account_type === 'savings');

      if (mainAccount && mainAccount.balance < 30000000) {
        const updateAccountBalances = async () => {
          toast.info("Updating your account balances to new values...");

          const { data: existingSeed } = await supabase
            .from('transactions')
            .select('id')
            .eq('name', 'Monthly Salary Deposit - Month 1')
            .eq('account_id', mainAccount.id)
            .limit(1);
          
          const newMainBalance = (existingSeed && existingSeed.length > 0) ? 80000000 : 68000000;
          
          const { error: mainUpdateError } = await supabase
            .from('accounts')
            .update({ balance: newMainBalance })
            .eq('id', mainAccount.id);

          if (mainUpdateError) {
            toast.error("Failed to update Main Account balance.");
            console.error('Failed to update main account:', mainUpdateError);
            return;
          }
          
          if (savingsAccount) {
            const { error: savingsUpdateError } = await supabase
              .from('accounts')
              .update({ balance: 500000 })
              .eq('id', savingsAccount.id);
            if (savingsUpdateError) {
              toast.error("Failed to update Savings Account balance.");
              console.error('Failed to update savings account:', savingsUpdateError);
              return;
            }
          }

          toast.success("Account balances have been updated!");
          queryClient.invalidateQueries({ queryKey: ['accounts', user!.id] });
        };
        
        updateAccountBalances();
      }
    }
  }, [user, accounts, queryClient]);

  return { accounts, isLoadingAccounts };
};
