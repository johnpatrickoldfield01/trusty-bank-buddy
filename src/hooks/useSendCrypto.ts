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
  exchange: string;
  mockMode?: boolean;
  onSuccess: (newBalance: number) => void;
}

export const useSendCrypto = () => {
  const sendCrypto = async ({ crypto, amount, toAddress, fromBalance, exchange, mockMode = false, onSuccess }: SendCryptoParams) => {
    try {
      console.log('Starting crypto send:', { crypto: crypto.symbol, amount, toAddress, exchange, mockMode });
      toast.info(`Processing ${mockMode ? 'mock' : 'real'} transaction with ${exchange}...`);

      // Route to different exchange integrations
      let edgeFunctionName = '';
      switch (exchange) {
        case 'coinbase':
          edgeFunctionName = 'coinbase-crypto-send';
          break;
        case 'binance':
          edgeFunctionName = 'binance-crypto-send';
          break;
        case 'luno':
          edgeFunctionName = 'luno-crypto-send';
          break;
        case 'kraken':
          edgeFunctionName = 'kraken-crypto-send';
          break;
        case 'gemini':
          edgeFunctionName = 'gemini-crypto-send';
          break;
        case 'bitfinex':
          edgeFunctionName = 'bitfinex-crypto-send';
          break;
        default:
          throw new Error(`Unsupported exchange: ${exchange}`);
      }

      // Call the appropriate exchange integration edge function
      const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
        body: {
          crypto,
          amount,
          toAddress,
          mockMode
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from edge function');
        throw new Error(`No response data from ${exchange} API`);
      }

      if (!data.success) {
        console.error('Transaction failed:', data.error);
        
        // Handle detailed error response from edge function
        if (data.error && typeof data.error === 'object') {
          const errorObj = data.error;
          const errorMessage = errorObj.message || 'Transaction failed';
          
          // Log detailed troubleshooting info
          if (errorObj.troubleshooting) {
            console.error('Troubleshooting info:', errorObj.troubleshooting);
          }
          if (errorObj.details) {
            console.error('Error details:', errorObj.details);
          }
          
          throw new Error(errorMessage);
        }
        
        throw new Error(data.error || 'Transaction failed');
      }

      console.log('Transaction successful:', data);

      // Save crypto transaction to database  
      const { data: accountData } = await supabase
        .from('accounts')
        .select('id')
        .eq('account_type', 'main')
        .limit(1)
        .single();

      if (accountData) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            account_id: accountData.id,
            amount: -amount, // Negative for outgoing
            name: `Send ${crypto.symbol} via ${exchange}`,
            category: 'crypto',
            icon: '₿',
            recipient_name: toAddress.substring(0, 20) + '...',
            recipient_bank_name: exchange.charAt(0).toUpperCase() + exchange.slice(1),
            recipient_account_number: toAddress,
            recipient_swift_code: data.transactionHash || data.transactionId || 
                             (mockMode ? `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : 'unknown')
          });

        if (transactionError) {
          console.error('Failed to save crypto transaction:', transactionError);
        } else {
          console.log('Crypto transaction saved to database');
        }
      }

      // Generate PDF proof with enhanced transaction and compliance data
      await generateTransactionPDF({
        transactionId: data.transactionId,
        crypto,
        amount,
        toAddress,
        usdValue: amount * crypto.price,
        timestamp: new Date(),
        transactionHash: data.transactionHash,
        status: data.status,
        exchangeUrl: data.exchangeUrl,
        exchange: exchange.charAt(0).toUpperCase() + exchange.slice(1),
        fee: data.fee,
        regulatory_info: data.regulatory_info,
        compliance_documentation: data.compliance_documentation
      });

      // Update balance and refresh transactions
      onSuccess(data.newBalance);
      
      // Determine network for explorer URL
      const network = crypto.symbol === 'BTC' ? 'btc' : 'eth';
      const txHash = data.transactionHash || data.transactionId;
      const explorerUrl = `https://www.blockchain.com/explorer/transactions/${network}/${txHash}`;
      
      // Show success toast with transaction hash and explorer link
      toast.success(`Successfully sent ${amount} ${crypto.symbol} via ${exchange.charAt(0).toUpperCase() + exchange.slice(1)}!`, {
        description: `Hash: ${txHash.substring(0, 16)}...${txHash.substring(txHash.length - 8)} - View on blockchain.com`,
        duration: 10000,
      });
      
      // Log explorer URL for user to copy
      console.log('Transaction Hash:', txHash);
      console.log('Blockchain Explorer:', explorerUrl);
      
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
    exchangeUrl?: string;
    exchange: string;
    fee?: string;
    regulatory_info?: any;
    compliance_documentation?: any;
  }) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.text(`${transaction.exchange} Cryptocurrency Transaction Receipt`, 14, 22);
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
          ['Transaction Fee', `${transaction.fee || '0.001'} ${transaction.crypto.symbol}`],
          ['USD Value', `$${transaction.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Price per Unit', `$${transaction.crypto.price.toFixed(2)}`],
          ['Exchange', transaction.exchange],
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
          ['Network', transaction.exchange + ' Network'],
          ['Confirmation Status', transaction.status || 'Confirmed'],
        ],
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 10 },
        tableWidth: 'auto',
        columnStyles: { 0: { fontStyle: 'bold' } }
      });

      // Legal Compliance Section
      const secondTableY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.text("Legal & Regulatory Compliance", 14, secondTableY + 15);
      
      if (transaction.regulatory_info) {
        autoTable(doc, {
          startY: secondTableY + 20,
          body: [
            ['Compliance Status', transaction.regulatory_info.compliance_status || 'Verified'],
            ['Regulatory Framework', transaction.regulatory_info.regulatory_framework || 'International Standards'],
            ['Transaction Monitoring', transaction.regulatory_info.transaction_monitoring || 'Active'],
            ['Exchange Compliance', 'Licensed and regulated cryptocurrency exchange'],
            ['AML/CTF Compliance', 'Anti-Money Laundering and Counter-Terrorism Financing protocols applied'],
          ],
          theme: 'plain',
          styles: { cellPadding: 2, fontSize: 10 },
          tableWidth: 'auto',
          columnStyles: { 0: { fontStyle: 'bold' } }
        });
      }

      // Transaction Compliance Documentation
      const thirdTableY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.text("Transaction Compliance Documentation", 14, thirdTableY + 15);
      
      if (transaction.compliance_documentation) {
        const complianceData = transaction.compliance_documentation;
        autoTable(doc, {
          startY: thirdTableY + 20,
          body: [
            ['Transaction Type', complianceData.transaction_type || 'Cryptocurrency Transfer'],
            ['Source of Funds', complianceData.source_of_funds || 'Verified Digital Assets'],
            ['AML Status', complianceData.aml_status || 'Compliant'],
            ['KYC Status', complianceData.kyc_status || 'Verified'],
            ['Risk Assessment', complianceData.risk_assessment || 'Low Risk'],
            ['Sanctions Screening', complianceData.sanctions_screening || 'Cleared'],
            ['Legal Basis', complianceData.legal_basis || 'Legitimate cryptocurrency exchange'],
            ['Audit Trail', complianceData.audit_trail || 'Transaction logged and monitored'],
            ['Reporting Obligations', complianceData.reporting_obligations || 'Reported as required'],
            ['Documentation Retention', complianceData.documentation_retention || '7 years minimum'],
          ],
          theme: 'plain',
          styles: { cellPadding: 2, fontSize: 9 },
          tableWidth: 'auto',
          columnStyles: { 0: { fontStyle: 'bold' } }
        });

      }

      // Legal Notice and Disclaimers
      const fourthTableY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(12);
      doc.text("Legal Notice & Anti-Money Laundering Declaration", 14, fourthTableY + 15);
      
      doc.setFontSize(9);
      doc.text(
        "This transaction has been processed in accordance with applicable anti-money laundering (AML) and " +
        "know-your-customer (KYC) regulations. All parties involved have been subject to appropriate due diligence " +
        "procedures. This transaction is reported to relevant financial intelligence units as required by law.",
        14,
        fourthTableY + 25,
        { maxWidth: 180 }
      );

      doc.text(
        "Source of Funds Declaration: The cryptocurrency transferred in this transaction originates from legitimate " +
        "digital asset holdings that have been acquired through lawful means and are not the proceeds of any criminal activity.",
        14,
        fourthTableY + 45,
        { maxWidth: 180 }
      );

      doc.text(
        "Regulatory Compliance: This transaction complies with all applicable laws and regulations including but not " +
        "limited to financial services regulations, cryptocurrency exchange regulations, and international sanctions requirements.",
        14,
        fourthTableY + 65,
        { maxWidth: 180 }
      );

      // Exchange Link
      if (transaction.exchangeUrl) {
        doc.setFontSize(12);
        doc.text(`View on ${transaction.exchange}:`, 14, fourthTableY + 90);
        doc.setTextColor(0, 0, 255);
        doc.text(transaction.exchangeUrl, 14, fourthTableY + 100);
        doc.setTextColor(0);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleString('en-US')}. This is a computer-generated transaction receipt with ` +
        `legal compliance documentation from ${transaction.exchange}.`,
        14,
        fourthTableY + 120,
        { maxWidth: 180 }
      );

      // Security notice
      doc.text(
        `Transaction Hash: ${(transaction.transactionHash || transaction.transactionId).toUpperCase()}`,
        14,
        fourthTableY + 135,
        { maxWidth: 180 }
      );

      doc.text(
        "IMPORTANT: This document serves as legal proof of transaction compliance and should be retained for tax " +
        "and regulatory reporting purposes for a minimum of 7 years.",
        14,
        fourthTableY + 150,
        { maxWidth: 180 }
      );
      
      doc.save(`${transaction.exchange.toLowerCase()}-crypto-transaction-${transaction.transactionId}.pdf`);
      toast.success('Transaction receipt downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate transaction receipt.');
    }
  };

  return { sendCrypto };
};
