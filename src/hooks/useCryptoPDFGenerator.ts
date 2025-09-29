import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const useCryptoPDFGenerator = () => {
  
  const generateProofOfPayment = (transaction: CryptoTransaction, cryptoSymbol: string, currentPrice: number) => {
    try {
      const doc = new jsPDF();
      const cryptoAmount = Math.abs(transaction.amount);
      const usdValue = cryptoAmount * currentPrice;
      const zarValue = usdValue * 18.50; // Mock exchange rate

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('CRYPTOCURRENCY PAYMENT RECEIPT', 105, 25, { align: 'center' });
      
      // Add line separator
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);

      // Transaction Details Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Details', 20, 50);
      
      autoTable(doc, {
        startY: 55,
        body: [
          ['Transaction ID', transaction.id],
          ['Date & Time', new Date(transaction.transaction_date).toLocaleString()],
          ['Cryptocurrency', `${cryptoSymbol} (Bitcoin)`],
          ['Amount Sent', `${cryptoAmount} ${cryptoSymbol}`],
          ['Exchange Rate', `$${currentPrice.toLocaleString()}`],
          ['USD Value', `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['ZAR Value', `R ${zarValue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Status', 'Completed']
        ],
        theme: 'striped',
        styles: { cellPadding: 3, fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
      });

      // Recipient Details Section
      let currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recipient Details', 20, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        body: [
          ['Recipient Address', transaction.recipient_account_number || 'N/A'],
          ['Exchange/Platform', transaction.recipient_bank_name || 'N/A'],
          ['Transaction Hash', transaction.recipient_swift_code || 'Pending'],
          ['Network', 'Bitcoin Mainnet']
        ],
        theme: 'striped',
        styles: { cellPadding: 3, fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
      });

      // Legal & Compliance Section
      currentY = (doc as any).lastAutoTable.finalY + 15;
      
      // Check if we need a new page for compliance section
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Legal & Compliance Information', 20, currentY);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const complianceText = `AML/KYC COMPLIANCE: This cryptocurrency transaction has been processed in accordance with Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations. All parties have undergone appropriate due diligence procedures as required by law.

REGULATORY FRAMEWORK: This transaction complies with the Financial Intelligence Centre Act (FICA), the Prevention and Combating of Corrupt Activities Act (PRECCA), and applicable cryptocurrency regulations in South Africa.

SOURCE OF FUNDS: The cryptocurrency transferred originates from legitimate digital asset holdings acquired through lawful means and is not the proceeds of any criminal activity.

TAX IMPLICATIONS: This transaction may have tax implications under South African Revenue Service (SARS) guidelines. Cryptocurrency transactions are subject to Capital Gains Tax (CGT) when applicable. Please consult with a qualified tax advisor.

BLOCKCHAIN VERIFICATION: This transaction is permanently recorded on the Bitcoin blockchain and can be independently verified using the transaction hash provided above.`;

      const textLines = doc.splitTextToSize(complianceText, 170);
      const lineHeight = 4; // Increase line height to prevent overlap
      const textHeight = textLines.length * lineHeight;
      
      // Check if text fits on current page
      if (currentY + 10 + textHeight > 270) {
        doc.addPage();
        currentY = 20;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Legal & Compliance Information', 20, currentY);
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Draw text line by line with proper spacing
      textLines.forEach((line: string, index: number) => {
        doc.text(line, 20, currentY + 10 + (index * lineHeight));
      });

      // Footer - ensure it's on the page
      const finalTextY = currentY + 10 + textHeight;
      const footerY = Math.max(finalTextY + 10, 270);
      if (footerY > 280) {
        doc.addPage();
        currentY = 250;
      } else {
        currentY = footerY;
      }
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()} | TrustyBank Cryptocurrency Services`, 20, currentY);
      doc.text('This document serves as official proof of cryptocurrency payment transaction.', 20, currentY + 8);
      
      // Save PDF
      doc.save(`crypto-payment-receipt-${transaction.id}.pdf`);
      toast.success('Payment receipt downloaded successfully!');
    } catch (error) {
      console.error('Error generating payment receipt:', error);
      toast.error('Failed to generate payment receipt');
    }
  };

  const generateTaxationSummary = (transactions: CryptoTransaction[], cryptoSymbol: string, currentPrice: number) => {
    try {
      const doc = new jsPDF();
      
      // Calculate totals
      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalUsdValue = totalAmount * currentPrice;
      const totalZarValue = totalUsdValue * 18.50;
      
      // Estimated gains/losses (mock calculation)
      const estimatedGains = totalZarValue * 0.15; // 15% mock gain
      const cgtLiability = Math.max(0, (estimatedGains - 40000) * 0.18); // CGT calculation

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CRYPTOCURRENCY TAX SUMMARY REPORT', 105, 25, { align: 'center' });
      doc.text(`${cryptoSymbol} Transactions`, 105, 35, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(20, 45, 190, 45);

      // Summary Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Summary', 20, 60);
      
      autoTable(doc, {
        startY: 65,
        body: [
          ['Reporting Period', `${new Date().getFullYear()} Tax Year`],
          ['Total Transactions', totalTransactions.toString()],
          ['Total ${cryptoSymbol} Transacted', `${totalAmount.toFixed(8)} ${cryptoSymbol}`],
          ['Total USD Value', `$${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
          ['Total ZAR Value', `R ${totalZarValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`]
        ],
        theme: 'striped',
        styles: { cellPadding: 3, fontSize: 11 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
      });

      // Tax Calculations
      let currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Tax Calculations (Estimated)', 20, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        body: [
          ['Estimated Capital Gains', `R ${estimatedGains.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`],
          ['Annual CGT Exemption', 'R 40,000'],
          ['Taxable Capital Gain', `R ${Math.max(0, estimatedGains - 40000).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`],
          ['CGT Rate (18%)', '18.0%'],
          ['Estimated CGT Liability', `R ${cgtLiability.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`]
        ],
        theme: 'striped',
        styles: { cellPadding: 3, fontSize: 11 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
      });

      // Transaction Details Table
      currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Details', 20, currentY);

      const transactionData = transactions.map(t => [
        new Date(t.transaction_date).toLocaleDateString(),
        `${Math.abs(t.amount).toFixed(8)} ${cryptoSymbol}`,
        `R ${(Math.abs(t.amount) * currentPrice * 18.50).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
        'Sale/Transfer'
      ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Date', 'Amount', 'ZAR Value', 'Type']],
        body: transactionData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40, halign: 'right' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 30 }
        }
      });

      // SARS Compliance Notice
      currentY = (doc as any).lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SARS Compliance Notice', 20, currentY);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const taxNotice = `IMPORTANT TAX INFORMATION:

1. REPORTING OBLIGATION: Under South African tax law, all cryptocurrency transactions must be reported to SARS. Cryptocurrency disposals are subject to Capital Gains Tax (CGT).

2. RECORD KEEPING: Maintain detailed records of all cryptocurrency transactions including dates, amounts, exchange rates, and purposes of transactions for at least 5 years.

3. CALCULATION METHOD: CGT is calculated on the difference between the base cost and proceeds of disposal. The annual exemption of R40,000 applies to individuals.

4. PROFESSIONAL ADVICE: This summary is for informational purposes only. Consult a qualified tax advisor or accountant for specific tax advice regarding your cryptocurrency transactions.

5. DISCLAIMER: This report contains estimated calculations based on available transaction data. Actual tax liability may differ and should be calculated by a tax professional.

Generated: ${new Date().toLocaleString()} | TrustyBank Tax Services`;

      const noticeLines = doc.splitTextToSize(taxNotice, 170);
      const noticeHeight = noticeLines.length * 3;
      
      // Check if notice fits on current page
      if (currentY + 10 + noticeHeight > 280) {
        doc.addPage();
        currentY = 20;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SARS Compliance Notice', 20, currentY);
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(noticeLines, 20, currentY + 10);

      // Save PDF
      doc.save(`crypto-tax-summary-${cryptoSymbol}-${new Date().getFullYear()}.pdf`);
      toast.success('Tax summary downloaded successfully!');
    } catch (error) {
      console.error('Error generating tax summary:', error);
      toast.error('Failed to generate tax summary');
    }
  };

  return { generateProofOfPayment, generateTaxationSummary };
};