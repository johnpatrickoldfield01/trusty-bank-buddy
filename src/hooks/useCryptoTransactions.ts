import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CryptoTransaction {
  id: string;
  amount: number;
  name: string;
  category: string;
  icon: string;
  recipient_name: string | null;
  recipient_bank_name: string | null;
  recipient_account_number: string | null;
  recipient_swift_code: string | null;
  transaction_date: string;
}

export const useCryptoTransactions = (cryptoSymbol?: string) => {
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [cryptoSymbol]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Get user's main account instead of crypto-specific account
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('account_type', 'main')
        .limit(1)
        .single();

      if (accountError) {
        console.error('Error fetching main account:', accountError);
        setError('Failed to fetch main account');
        return;
      }

      console.log('Fetching crypto transactions for account:', accountData.id);

      // Fetch crypto transactions
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountData.id)
        .eq('category', 'crypto')
        .order('transaction_date', { ascending: false });

      if (cryptoSymbol) {
        query = query.ilike('name', `%${cryptoSymbol}%`);
      }

      const { data, error: transactionError } = await query;

      console.log('Crypto transactions fetched:', data, 'Error:', transactionError);

      if (transactionError) {
        console.error('Error fetching transactions:', transactionError);
        setError('Failed to fetch transactions');
        return;
      }

      setTransactions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchTransactions:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { transactions, loading, error, refetch: fetchTransactions };
};