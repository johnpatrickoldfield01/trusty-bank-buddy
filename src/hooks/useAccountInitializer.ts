import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { type Database } from '@/integrations/supabase/types';
import { type User } from '@supabase/supabase-js';

export const useAccountInitializer = () => {
    const queryClient = useQueryClient();

    const addHomeLoanAccount = async (user: User) => {
        toast.info("Setting up your Home Loan account...");

        const homeLoanAccount: Database['public']['Tables']['accounts']['Insert'] = {
            user_id: user.id,
            account_type: 'loan',
            account_name: 'Home Loan',
            balance: -20000000.00,
            account_number: '1122334455667788'
        };

        const { error } = await supabase.from('accounts').insert(homeLoanAccount);

        if (error) {
            toast.error('Failed to set up your Home Loan account.');
            console.error('Failed to create home loan account:', error);
            return;
        }

        toast.success('Your Home Loan account has been set up!');
        await queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    };

    const initializeAccounts = async (user: User) => {
        toast.info("Setting up your new accounts...");

        const initialAccounts: Array<Database['public']['Tables']['accounts']['Insert']> = [
          { user_id: user.id, account_type: 'main', account_name: 'Main Account', balance: 125750.00, account_number: '1234567890123456' },
          { user_id: user.id, account_type: 'savings', account_name: 'Savings Account', balance: 32450.00, account_number: '9876543210987654' },
          { user_id: user.id, account_type: 'credit', account_name: 'Credit Card', balance: -2430.50, account_number: '5555666677778888' },
          { user_id: user.id, account_type: 'loan', account_name: 'Business Loan', balance: -185000.00, account_number: '4321876543210987' },
        ];

        const { data: newAccounts, error } = await supabase.from('accounts').insert(initialAccounts).select();
        
        if (error || !newAccounts) {
          toast.error('Failed to initialize your accounts. Please refresh the page.');
          console.error('Failed to create initial accounts:', error);
          return;
        }
        
        toast.success('Your accounts have been initialized!');

        const mainAccount = newAccounts.find(acc => acc.account_type === 'main');
        if (mainAccount) {
            toast.info("Adding some sample transaction history...");
            const sampleSpendTransactions = [
                { account_id: mainAccount.id, name: 'Online Shopping', amount: -1200.50, category: 'Shopping', icon: '🛍️' },
                { account_id: mainAccount.id, name: 'Groceries', amount: -850.75, category: 'Food', icon: '🛒' },
                { account_id: mainAccount.id, name: 'Monthly Subscription', amount: -99.99, category: 'Bills', icon: '🧾' },
                { account_id: mainAccount.id, name: 'Dinner with Friends', amount: -600.00, category: 'Entertainment', icon: '🍽️' },
            ];
            
            await supabase.from('transactions').insert(sampleSpendTransactions);
        }

        await queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
        await queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
        await queryClient.invalidateQueries({ queryKey: ['monthlySpending', user?.id] });
    };

    return { initializeAccounts, addHomeLoanAccount };
};
