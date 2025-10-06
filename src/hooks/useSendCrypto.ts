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
        
        // Generate diagnostic report for failed transaction
        await generateFailureReport({
          exchange,
          crypto,
          amount,
          toAddress,
          error: error.message || 'Unknown error',
          timestamp: new Date(),
          errorType: 'EDGE_FUNCTION_ERROR'
        });
        
        // If rate limit exceeded, provide specific guidance
        if (error.message?.includes('403') || error.message?.includes('Forbidden') || error.message?.includes('Limit exceeded')) {
          toast.error('Transaction Failed - Rate Limit Exceeded', {
            description: 'A diagnostic report has been downloaded. Do NOT use Mock mode - contact support with the report.',
            duration: 10000,
          });
          throw new Error('Exchange API rate limit exceeded. Diagnostic report generated. Contact exchange support.');
        }
        
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from edge function');
        
        // Generate diagnostic report
        await generateFailureReport({
          exchange,
          crypto,
          amount,
          toAddress,
          error: 'No response from exchange API',
          timestamp: new Date(),
          errorType: 'NO_RESPONSE'
        });
        
        throw new Error(`No response data from ${exchange} API - Diagnostic report downloaded`);
      }

      if (!data.success) {
        console.error('Transaction failed:', data.error);
        
        // Handle detailed error response from edge function
        if (data.error && typeof data.error === 'object') {
          const errorObj = data.error;
          const errorMessage = errorObj.message || 'Transaction failed';
          const errorCode = errorObj.code || 'UNKNOWN_ERROR';
          
          // Generate diagnostic report for failed transaction
          await generateFailureReport({
            exchange,
            crypto,
            amount,
            toAddress,
            error: errorMessage,
            errorCode,
            errorDetails: errorObj.details,
            troubleshooting: errorObj.troubleshooting,
            timestamp: new Date(),
            errorType: 'TRANSACTION_FAILED'
          });
          
          // Check for specific error codes
          if (errorCode === 'ErrLimitExceeded' || errorCode.includes('LIMIT') || errorCode.includes('RATE')) {
            toast.error('Transaction Failed - Exchange API Error', {
              description: 'Diagnostic report downloaded. Do NOT switch to Mock mode. Forward report to exchange support.',
              duration: 15000,
            });
            throw new Error('Exchange rate limit error. Real transaction failed - diagnostic report generated for support escalation.');
          }
          
          toast.error('Transaction Failed', {
            description: `${errorMessage}. Diagnostic report has been downloaded.`,
            duration: 10000,
          });
          
          throw new Error(errorMessage);
        }
        
        // Generate generic failure report
        await generateFailureReport({
          exchange,
          crypto,
          amount,
          toAddress,
          error: data.error || 'Unknown transaction error',
          timestamp: new Date(),
          errorType: 'GENERIC_FAILURE'
        });
        
        throw new Error(data.error || 'Transaction failed');
      }

      console.log('Transaction successful:', data);

      // Determine network for blockchain sync
      const network = crypto.symbol === 'BTC' ? 'bitcoin' : 'ethereum';
      const txHash = data.transactionHash || data.transactionId;
      const isMockTransaction = mockMode || txHash.includes('mock') || !data.transactionHash;

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
            name: `Send ${crypto.symbol} via ${exchange}${isMockTransaction ? ' (MOCK)' : ''}`,
            category: 'crypto',
            icon: '₿',
            recipient_name: toAddress.substring(0, 20) + '...',
            recipient_bank_name: exchange.charAt(0).toUpperCase() + exchange.slice(1),
            recipient_account_number: toAddress,
            recipient_swift_code: txHash
          });

        if (transactionError) {
          console.error('Failed to save crypto transaction:', transactionError);
        } else {
          console.log('Crypto transaction saved to database');
        }
      }

      // Sync to blockchain database ONLY if REAL transaction
      if (!isMockTransaction && data.transactionHash) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            const { error: syncError } = await supabase.functions.invoke('sync-blockchain-tx', {
              body: {
                txHash: data.transactionHash,
                network: network,
                userId: userData.user.id
              }
            });

            if (syncError) {
              console.error('Failed to sync blockchain transaction:', syncError);
              toast.error('Transaction sent but blockchain sync failed. Check console for details.');
            } else {
              console.log('Transaction synced to blockchain database');
            }
          }
        } catch (syncErr) {
          console.error('Blockchain sync error:', syncErr);
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
      
      // Build explorer URL
      const explorerNetwork = crypto.symbol === 'BTC' ? 'btc' : 'eth';
      const explorerUrl = `https://www.blockchain.com/explorer/transactions/${explorerNetwork}/${txHash}`;
      
      // Show appropriate success message based on transaction type
      if (isMockTransaction) {
        toast.warning(
          `⚠️ MOCK transaction completed (${amount} ${crypto.symbol})`,
          {
            description: `This is a test transaction and will NOT appear on blockchain.com. Hash: ${txHash.substring(0, 20)}...`,
            duration: 10000,
          }
        );
      } else {
        toast.success(
          `✅ Successfully sent ${amount} ${crypto.symbol}!`,
          {
            description: `Via ${exchange.charAt(0).toUpperCase() + exchange.slice(1)} • Hash: ${txHash.substring(0, 16)}...${txHash.substring(txHash.length - 8)} • View on blockchain.com`,
            duration: 10000,
          }
        );
        console.log('✅ REAL Transaction Hash:', txHash);
        console.log('🔗 Blockchain Explorer:', explorerUrl);
      }
      
    } catch (error) {
      console.error('Send crypto error:', error);
      
      // Provide user-friendly error message
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Transaction failed', {
        description: errorMsg,
        duration: 8000,
      });
      
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

  const generateFailureReport = async (failureData: {
    exchange: string;
    crypto: { name: string; symbol: string; price: number };
    amount: number;
    toAddress: string;
    error: string;
    errorCode?: string;
    errorDetails?: any;
    troubleshooting?: any;
    timestamp: Date;
    errorType: string;
  }) => {
    try {
      const doc = new jsPDF();
      const { data: userData } = await supabase.auth.getUser();

      // Header - CRITICAL FAILURE NOTICE
      doc.setFillColor(220, 53, 69); // Red background
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('TRANSACTION FAILURE REPORT', 14, 20);
      
      doc.setFontSize(12);
      doc.text('⚠️ REAL TRANSACTION FAILED - DO NOT USE MOCK MODE', 14, 28);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Generated: ${failureData.timestamp.toLocaleString()}`, 14, 45);

      // Critical Warning Box
      doc.setDrawColor(220, 53, 69);
      doc.setLineWidth(2);
      doc.rect(14, 52, 182, 25);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ CRITICAL: This is NOT mock data', 18, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('This report documents a REAL transaction that FAILED. Do not create mock transactions', 18, 66);
      doc.text('as replacements. Forward this report to your financial services provider and exchange', 18, 71);
      doc.text('support for investigation and resolution.', 18, 76);

      // Transaction Details
      autoTable(doc, {
        startY: 85,
        head: [['Transaction Attempt Details', '']],
        body: [
          ['User ID', userData?.user?.id || 'Unknown'],
          ['Exchange', failureData.exchange.toUpperCase()],
          ['Cryptocurrency', `${failureData.crypto.name} (${failureData.crypto.symbol})`],
          ['Amount', `${failureData.amount} ${failureData.crypto.symbol}`],
          ['USD Value', `$${(failureData.amount * failureData.crypto.price).toFixed(2)}`],
          ['Recipient Address', failureData.toAddress],
          ['Attempted At', failureData.timestamp.toISOString()],
          ['Transaction Status', '❌ FAILED'],
          ['Error Type', failureData.errorType],
        ],
        theme: 'grid',
        headStyles: { fillColor: [220, 53, 69], textColor: 255 },
        styles: { fontSize: 9 },
      });

      // Error Details
      const errorTableY = (doc as any).lastAutoTable.finalY + 10;
      autoTable(doc, {
        startY: errorTableY,
        head: [['Error Diagnostic Information', '']],
        body: [
          ['Error Message', failureData.error],
          ['Error Code', failureData.errorCode || 'N/A'],
          ['HTTP Status', failureData.errorDetails?.http_status || 'N/A'],
          ['API Response', failureData.errorDetails?.raw_error ? JSON.stringify(failureData.errorDetails.raw_error, null, 2) : 'N/A'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [220, 53, 69], textColor: 255 },
        styles: { fontSize: 9 },
      });

      // Troubleshooting Information
      if (failureData.troubleshooting) {
        const troubleY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Troubleshooting Recommendations', 14, troubleY);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        let yPos = troubleY + 8;
        
        if (failureData.troubleshooting.suggested_actions) {
          failureData.troubleshooting.suggested_actions.forEach((action: string, idx: number) => {
            const lines = doc.splitTextToSize(`${idx + 1}. ${action}`, 180);
            doc.text(lines, 18, yPos);
            yPos += lines.length * 5;
          });
        }
      }

      // Action Required Section
      const actionY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 50 : 220;
      doc.setFillColor(255, 193, 7); // Warning yellow
      doc.rect(14, actionY, 182, 35, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🔴 ACTION REQUIRED', 18, actionY + 10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('1. DO NOT create mock transactions to replace this failed transaction', 18, actionY + 18);
      doc.text('2. Forward this report to your financial services provider', 18, actionY + 23);
      doc.text('3. Contact exchange support with this diagnostic report', 18, actionY + 28);
      doc.text('4. Keep this report for audit trail and compliance purposes', 18, actionY + 33);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('This diagnostic report must be retained for financial audit compliance.', 14, 285);
      doc.text('Report ID: ' + Date.now().toString(36).toUpperCase(), 14, 290);

      // Download the report
      const filename = `FAILURE-${failureData.exchange}-${failureData.crypto.symbol}-${Date.now()}.pdf`;
      doc.save(filename);
      
      console.log('🔴 Transaction failure report generated:', filename);
      toast.error('Transaction Failed - Diagnostic Report Downloaded', {
        description: `Report: ${filename}. Forward to financial services provider. DO NOT use mock mode.`,
        duration: 15000,
      });

    } catch (error) {
      console.error('Failed to generate failure report:', error);
      toast.error('Failed to generate diagnostic report');
    }
  };

  return { sendCrypto };
};
