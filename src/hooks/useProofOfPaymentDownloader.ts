
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Database } from '@/integrations/supabase/types';
import { type Profile } from '@/components/layout/AppLayout';
import { useCurrencyLocation } from '@/contexts/CurrencyLocationContext';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type AccountInfo = Pick<Database['public']['Tables']['accounts']['Row'], 'account_name' | 'account_number' | 'account_type'>;

export type TransactionWithAccountDetails = TransactionRow & {
  accounts: AccountInfo | null;
};

export const useProofOfPaymentDownloader = () => {
  const { formatCurrency } = useCurrencyLocation();
  
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
          ['Amount', formatCurrency(Math.abs(transaction.amount))],
          ['Status', 'Completed'],
        ],
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 10 },
        tableWidth: 'auto',
        columnStyles: { 0: { fontStyle: 'bold' } }
      });

      // Footer
      const finalTableY = (doc as any).lastAutoTable.finalY;
      // Legal and Banking Arbitrage Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text("Legal & Banking Arbitrage Information", 14, finalTableY + 10);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const legalText = `
LEGAL FRAMEWORK & ARBITRAGE PROVISIONS:

Banking Arbitrage: This transaction is governed by the South African banking laws and regulations as administered by the South African Reserve Bank (SARB). Any disputes arising from this transaction shall be subject to banking arbitrage procedures as outlined in the National Credit Act and Banking Services Act.

Regulatory Compliance: TrustyBank operates under Financial Services Provider License FSP12345 and adheres to all prescribed banking regulations including the Prevention of Organised Crime Act (POCA), Financial Intelligence Centre Act (FICA), and Exchange Control Regulations.

Dispute Resolution: Should any dispute arise regarding this payment, the matter shall first be referred to TrustyBank's internal dispute resolution mechanism. If unresolved, the matter may be escalated to the Banking Ombudsman or the Financial Sector Conduct Authority (FSCA) for arbitrage.

Legal Jurisdiction: This transaction and any related disputes shall be subject to the jurisdiction of South African courts, with specific reference to banking law precedents and regulatory framework.

Documentation Retention: This proof of payment must be retained for a minimum of 7 years as required by banking regulations and may be used as evidence in any legal or arbitrage proceedings.

Contact for Legal Matters: legal@trustybank.com | Banking Ombudsman: 0860 800 900`;

      doc.text(legalText, 14, finalTableY + 20, { maxWidth: 180 });
      
      // Footer with enhanced legal notice
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleString('en-ZA')}. This is a legally binding document issued by TrustyBank (Pty) Ltd.`,
        14,
        finalTableY + 100,
        { maxWidth: 180 }
      );
      
      doc.text(
        `FSP License: 12345 | Registered Office: 123 Financial St, Cape Town 8001 | SARB Regulated Institution`,
        14,
        finalTableY + 110,
        { maxWidth: 180 }
      );
      
      doc.save(`proof-of-payment-${transaction.id}.pdf`);
      toast.success('Proof of payment with legal arbitrage information downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate proof of payment. Please try again.');
    }
  };

  return { downloadProofOfPayment };
};
