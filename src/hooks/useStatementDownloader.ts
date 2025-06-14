
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { type Database } from '@/integrations/supabase/types';
import { type Profile } from '@/components/layout/AppLayout';

type Account = Database['public']['Tables']['accounts']['Row'];

export const useStatementDownloader = () => {
  const downloadStatement = async (profile: Profile | null, mainAccount: Account | undefined) => {
    if (!profile || !mainAccount) {
      toast.error('Could not get user or account details to generate statement.');
      return;
    }

    try {
      toast.info('Generating your statement...');

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', mainAccount.id)
        .gte('transaction_date', threeMonthsAgo.toISOString())
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      if (!transactions || transactions.length === 0) {
        toast.warning('No transactions found for the last 3 months.');
        return;
      }
      
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.text("Bank Statement", 14, 22);
      doc.setFontSize(12);
      doc.text(`Account Holder: ${profile.full_name || ''}`, 14, 35);
      doc.text(`Account Name: ${mainAccount.account_name}`, 14, 42);
      doc.text(`Account Number: ${mainAccount.account_number || ''}`, 14, 49);

      const startDate = threeMonthsAgo.toLocaleDateString('en-ZA');
      const endDate = new Date().toLocaleDateString('en-ZA');
      doc.text(`Statement Period: ${startDate} - ${endDate}`, 14, 60);

      // Table
      autoTable(doc, {
        startY: 70,
        head: [['Date', 'Description', 'Amount (R)']],
        body: transactions.map(tx => [
          new Date(tx.transaction_date).toLocaleDateString('en-ZA'),
          tx.name,
          tx.amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }).replace('ZAR', ''),
        ]),
        headStyles: { fillColor: [34, 197, 94] },
      });

      // Download
      doc.save(`statement-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Statement downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF statement:', error);
      toast.error('Failed to generate statement. Please try again.');
    }
  };

  return { downloadStatement };
};
