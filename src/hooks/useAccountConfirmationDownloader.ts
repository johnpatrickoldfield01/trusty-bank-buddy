
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { type Profile } from '@/components/layout/AppLayout';
import { type Database } from '@/integrations/supabase/types';

type Account = Database['public']['Tables']['accounts']['Row'];

export const useAccountConfirmationDownloader = () => {
  const downloadAccountConfirmation = (profile: Profile | null, mainAccount: Account | undefined) => {
    if (!profile || !mainAccount) {
      toast.error('Could not get user or account details to generate confirmation letter.');
      return;
    }

    try {
      toast.info('Generating your account confirmation letter...');
      
      const doc = new jsPDF();
      const accountNumber = (mainAccount.account_number || '').replace(/[^a-zA-Z0-9]/g, '');

      // Header
      doc.setFontSize(22);
      doc.text("Account Confirmation Letter", 14, 22);
      
      // Bank info
      doc.setFontSize(12);
      doc.text("Lovable Bank Inc.", 14, 40);
      doc.text("123 Finance Street, Money City, 12345", 14, 46);
      doc.text(`Date: ${format(new Date(), 'yyyy-MM-dd')}`, 14, 52);

      // Add a line separator
      doc.setLineWidth(0.5);
      doc.line(14, 60, 196, 60);

      // Client and Account info
      doc.setFontSize(12);
      doc.text(`To whom it may concern,`, 14, 70);
      doc.text(`This letter is to confirm that ${profile.full_name || 'the client'} holds an account with Lovable Bank.`, 14, 80, { maxWidth: 180 });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Account Holder:`, 14, 95);
      doc.setFont('helvetica', 'normal');
      doc.text(`${profile.full_name || ''}`, 55, 95);

      doc.setFont('helvetica', 'bold');
      doc.text(`Account Name:`, 14, 102);
      doc.setFont('helvetica', 'normal');
      doc.text(`${mainAccount.account_name}`, 55, 102);

      doc.setFont('helvetica', 'bold');
      doc.text(`Account Number:`, 14, 109);
      doc.setFont('helvetica', 'normal');
      doc.text(`${accountNumber}`, 55, 109);

      doc.setFont('helvetica', 'bold');
      doc.text(`Account Type:`, 14, 116);
      doc.setFont('helvetica', 'normal');
      doc.text(`${mainAccount.account_type}`, 55, 116);

      doc.setFont('helvetica', 'bold');
      doc.text(`Current Balance:`, 14, 123);
      doc.setFont('helvetica', 'normal');
      doc.text(`R${(mainAccount.balance || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 55, 123);

      doc.setFont('helvetica', 'bold');
      doc.text(`Account Opened:`, 14, 130);
      doc.setFont('helvetica', 'normal');
      doc.text(`${format(new Date(mainAccount.created_at), 'yyyy-MM-dd')}`, 55, 130);
      
      doc.setFontSize(12);
      doc.text(`This account is active and in good standing as of the date of this letter.`, 14, 145, { maxWidth: 180 });

      doc.text(`Sincerely,`, 14, 165);
      doc.text(`Lovable Bank Management`, 14, 172);

      // Download
      doc.save(`account-confirmation-${accountNumber}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Account confirmation letter downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate confirmation letter. Please try again.');
    }
  };

  return { downloadAccountConfirmation };
};
