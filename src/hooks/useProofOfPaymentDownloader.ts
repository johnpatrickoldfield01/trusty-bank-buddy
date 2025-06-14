
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Database } from '@/integrations/supabase/types';
import { type Profile } from '@/components/layout/AppLayout';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type AccountInfo = Pick<Database['public']['Tables']['accounts']['Row'], 'account_name' | 'account_number' | 'account_type'>;

export type TransactionWithAccountDetails = TransactionRow & {
  accounts: AccountInfo | null;
};

export const useProofOfPaymentDownloader = () => {
  const downloadProofOfPayment = async (profile: Profile | null, transaction: TransactionWithAccountDetails | null) => {
    if (!profile || !transaction) {
      toast.error('Could not get user or transaction details to generate proof of payment.');
      return;
    }

    if (!transaction.accounts) {
      toast.error('Transaction is not associated with an account.');
      return;
    }

    try {
      toast.info('Generating your proof of payment...');

      const doc = new jsPDF();
      const isDeposit = transaction.amount > 0;

      // Header
      doc.setFontSize(22);
      doc.text("Proof of Payment", 14, 22);
      doc.setFontSize(12);

      // Add a line separator
      doc.setLineWidth(0.5);
      doc.line(14, 28, 196, 28);

      // My Details
      doc.setFontSize(14);
      doc.text("My Details", 14, 40);
      autoTable(doc, {
        startY: 45,
        body: [
          ['Account Holder', profile.full_name || ''],
          ['Account Name', transaction.accounts.account_name],
          ['Account Number', transaction.accounts.account_number || ''],
        ],
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 10 },
        tableWidth: 'auto',
        columnStyles: { 0: { fontStyle: 'bold' } }
      });

      // Recipient/Sender Details
      const lastTableY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.text(isDeposit ? 'Sender Details' : 'Recipient Details', 14, lastTableY + 15);
      
      const recipientDetailsBody: (string | null)[][] = [];
      if (transaction.recipient_bank_name) {
        recipientDetailsBody.push(['Name', transaction.recipient_name || '']);
        recipientDetailsBody.push(['Bank', transaction.recipient_bank_name]);
        recipientDetailsBody.push(['Account Number', transaction.recipient_account_number || '']);
        if (transaction.recipient_swift_code) {
          recipientDetailsBody.push(['SWIFT Code', transaction.recipient_swift_code]);
        }
      } else {
        recipientDetailsBody.push(['Name', isDeposit ? 'External Employer Co.' : transaction.name.replace('Transfer to ', '')]);
        recipientDetailsBody.push(['Bank', 'Other Bank Inc.']);
        recipientDetailsBody.push(['Account Number', '**** **** **** 3456']);
      }

      autoTable(doc, {
        startY: lastTableY + 20,
        body: recipientDetailsBody,
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 10 },
        tableWidth: 'auto',
        columnStyles: { 0: { fontStyle: 'bold' } }
      });

      // Transaction Details
      const secondTableY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.text("Transaction Details", 14, secondTableY + 15);
      autoTable(doc, {
        startY: secondTableY + 20,
        body: [
          ['Transaction ID', transaction.id],
          ['Description', transaction.name],
          ['Date', new Date(transaction.transaction_date).toLocaleString('en-ZA')],
          ['Category', transaction.category || 'Uncategorized'],
          ['Amount', `R ${Math.abs(transaction.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Status', 'Completed'],
        ],
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 10 },
        tableWidth: 'auto',
        columnStyles: { 0: { fontStyle: 'bold' } }
      });

      // Footer
      const finalTableY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleString('en-ZA')}. This is a computer-generated document and does not require a signature.`,
        14,
        finalTableY + 20,
        { maxWidth: 180 }
      );
      
      doc.save(`proof-of-payment-${transaction.id}.pdf`);
      toast.success('Proof of payment downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate proof of payment. Please try again.');
    }
  };

  return { downloadProofOfPayment };
};
