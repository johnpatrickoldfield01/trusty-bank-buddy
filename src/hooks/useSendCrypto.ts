
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SendCryptoParams {
  crypto: {
    name: string;
    symbol: string;
    price: number;
  };
  amount: number;
  toAddress: string;
  fromBalance: number;
  onSuccess: (newBalance: number) => void;
}

export const useSendCrypto = () => {
  const sendCrypto = async ({ crypto, amount, toAddress, fromBalance, onSuccess }: SendCryptoParams) => {
    try {
      toast.info('Processing transaction...');

      // Simulate API call to Coinbase (in real implementation, this would call Coinbase API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate transaction ID
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate new balance
      const newBalance = fromBalance - amount;
      
      // Generate PDF proof
      await generateTransactionPDF({
        transactionId,
        crypto,
        amount,
        toAddress,
        usdValue: amount * crypto.price,
        timestamp: new Date(),
      });

      // Update balance
      onSuccess(newBalance);
      
      toast.success(`Successfully sent ${amount} ${crypto.symbol}!`);
      
    } catch (error) {
      console.error('Send crypto error:', error);
      toast.error('Failed to send cryptocurrency. Please try again.');
      throw error;
    }
  };

  const generateTransactionPDF = async (transaction: {
    transactionId: string;
    crypto: { name: string; symbol: string; price: number };
    amount: number;
    toAddress: string;
    usdValue: number;
    timestamp: Date;
  }) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.text("Cryptocurrency Transaction Receipt", 14, 22);
      doc.setFontSize(12);

      // Add a line separator
      doc.setLineWidth(0.5);
      doc.line(14, 28, 196, 28);

      // Transaction Details
      doc.setFontSize(14);
      doc.text("Transaction Details", 14, 40);
      
      autoTable(doc, {
        startY: 45,
        body: [
          ['Transaction ID', transaction.transactionId],
          ['Date & Time', transaction.timestamp.toLocaleString('en-US')],
          ['Status', 'Completed'],
          ['Cryptocurrency', `${transaction.crypto.name} (${transaction.crypto.symbol})`],
          ['Amount Sent', `${transaction.amount.toLocaleString()} ${transaction.crypto.symbol}`],
          ['USD Value', `$${transaction.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Price per Unit', `$${transaction.crypto.price.toFixed(2)}`],
        ],
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 10 },
        tableWidth: 'auto',
        columnStyles: { 0: { fontStyle: 'bold' } }
      });

      // Recipient Details
      const lastTableY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.text("Recipient Details", 14, lastTableY + 15);
      
      autoTable(doc, {
        startY: lastTableY + 20,
        body: [
          ['Recipient Address', transaction.toAddress],
          ['Network', 'Coinbase API'],
          ['Confirmation Status', 'Confirmed'],
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
        `Generated on ${new Date().toLocaleString('en-US')}. This is a computer-generated transaction receipt.`,
        14,
        finalTableY + 20,
        { maxWidth: 180 }
      );

      // Security notice
      doc.text(
        `Transaction Hash: ${transaction.transactionId.toUpperCase()}`,
        14,
        finalTableY + 35,
        { maxWidth: 180 }
      );
      
      doc.save(`crypto-transaction-${transaction.transactionId}.pdf`);
      toast.success('Transaction receipt downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate transaction receipt.');
    }
  };

  return { sendCrypto };
};
