import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Starting crypto send:', { crypto: crypto.symbol, amount, toAddress });
      toast.info('Processing transaction with Coinbase...');

      // Call the Coinbase integration edge function
      const { data, error } = await supabase.functions.invoke('coinbase-crypto-send', {
        body: {
          crypto,
          amount,
          toAddress
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from edge function');
        throw new Error('No response data from Coinbase API');
      }

      if (!data.success) {
        console.error('Transaction failed:', data.error);
        throw new Error(data.error || 'Transaction failed');
      }

      console.log('Transaction successful:', data);

      // Generate PDF proof with transaction data
      await generateTransactionPDF({
        transactionId: data.transactionId,
        crypto,
        amount,
        toAddress,
        usdValue: amount * crypto.price,
        timestamp: new Date(),
        transactionHash: data.transactionHash,
        status: data.status,
        coinbaseUrl: data.coinbaseTransactionUrl
      });

      // Update balance
      onSuccess(data.newBalance);
      
      toast.success(`Successfully sent ${amount} ${crypto.symbol} via Coinbase!`);
      
    } catch (error) {
      console.error('Send crypto error:', error);
      toast.error(`Failed to send cryptocurrency: ${error.message}`);
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
    transactionHash?: string;
    status?: string;
    coinbaseUrl?: string;
  }) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.text("Coinbase Cryptocurrency Transaction Receipt", 14, 22);
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
          ['Transaction Hash', transaction.transactionHash || 'Pending'],
          ['Date & Time', transaction.timestamp.toLocaleString('en-US')],
          ['Status', transaction.status || 'Completed'],
          ['Cryptocurrency', `${transaction.crypto.name} (${transaction.crypto.symbol})`],
          ['Amount Sent', `${transaction.amount.toLocaleString()} ${transaction.crypto.symbol}`],
          ['USD Value', `$${transaction.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Price per Unit', `$${transaction.crypto.price.toFixed(2)}`],
          ['Network', 'Coinbase'],
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
          ['Confirmation Status', transaction.status || 'Confirmed'],
        ],
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 10 },
        tableWidth: 'auto',
        columnStyles: { 0: { fontStyle: 'bold' } }
      });

      // Coinbase Link
      const finalTableY = (doc as any).lastAutoTable.finalY;
      if (transaction.coinbaseUrl) {
        doc.setFontSize(12);
        doc.text("View on Coinbase:", 14, finalTableY + 15);
        doc.setTextColor(0, 0, 255);
        doc.text(transaction.coinbaseUrl, 14, finalTableY + 25);
        doc.setTextColor(0);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleString('en-US')}. This is a computer-generated transaction receipt from Coinbase.`,
        14,
        finalTableY + 40,
        { maxWidth: 180 }
      );

      // Security notice
      doc.text(
        `Transaction Hash: ${(transaction.transactionHash || transaction.transactionId).toUpperCase()}`,
        14,
        finalTableY + 55,
        { maxWidth: 180 }
      );
      
      doc.save(`coinbase-crypto-transaction-${transaction.transactionId}.pdf`);
      toast.success('Transaction receipt downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate transaction receipt.');
    }
  };

  return { sendCrypto };
};
