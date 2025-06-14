
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { startOfMonth, endOfMonth } from 'date-fns';

export const useMonthlySpending = () => {
  const { user } = useSession();

  const { data: spendingThisMonth, isLoading: isLoadingSpending } = useQuery({
    queryKey: ['monthlySpending', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const now = new Date();
      const startDate = startOfMonth(now).toISOString();
      const endDate = endOfMonth(now).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .lt('amount', 0); // Only negative amounts (spending)
        
      if (error) throw new Error(error.message);

      const totalSpending = data.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      return totalSpending;
    },
    enabled: !!user,
  });

  return { spendingThisMonth, isLoadingSpending };
};
