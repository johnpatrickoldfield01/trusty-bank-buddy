
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { formatDistanceToNow } from 'date-fns';
import { type Transaction } from '@/components/dashboard/TransactionList';

export const useTransactions = (limit = 5) => {
  const { user } = useSession();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false }).limit(limit);
      if (error) throw new Error(error.message);
      return data.map((tx): Transaction => ({
        id: tx.id,
        name: tx.name,
        amount: tx.amount,
        date: formatDistanceToNow(new Date(tx.transaction_date), { addSuffix: true }),
        category: tx.category || '',
        icon: tx.icon || '💸',
      }));
    },
    enabled: !!user,
  });

  return { transactions, isLoadingTransactions };
};

