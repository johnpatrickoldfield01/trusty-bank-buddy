
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';

export const useLoan = (loanId: string | undefined) => {
  const { user } = useSession();

  const { data: loan, isLoading: isLoadingLoan } = useQuery({
    queryKey: ['account', loanId],
    queryFn: async () => {
      if (!user || !loanId) return null;
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', loanId)
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching loan account:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!user && !!loanId,
  });

  return { loan, isLoadingLoan };
};
