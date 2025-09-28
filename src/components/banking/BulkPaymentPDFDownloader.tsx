import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BulkPaymentSchedule {
  id: string;
  schedule_name: string;
  beneficiary_ids: string[];
  amount_per_beneficiary: number;
  frequency: string;
  next_execution_date: string;
  currency?: string;
}

interface BulkPaymentPDFProps {
  schedule: BulkPaymentSchedule;
  beneficiaries: any[];
  downloadType: 'individual' | 'bulk';
  className?: string;
}

const BulkPaymentPDFDownloader = ({ schedule, beneficiaries, downloadType, className }: BulkPaymentPDFProps) => {
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const currency = schedule.currency || 'ZAR';
      
      if (downloadType === 'bulk') {
        // Bulk schedule PDF
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('BULK PAYMENT SCHEDULE SUMMARY', 105, 30, { align: 'center' });
        
        // Company header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TrustyBank - Bulk Payment Services', 20, 45);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Licensed Financial Services Provider | FSP License: [DEMO-PURPOSES-ONLY]', 20, 52);
        
        // Schedule details
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Schedule Details:', 20, 65);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const scheduleDetails = [
          ['Schedule Name:', schedule.schedule_name],
          ['Frequency:', schedule.frequency],
          ['Amount per Beneficiary:', `${currency} ${schedule.amount_per_beneficiary.toLocaleString()}`],
          ['Total Beneficiaries:', schedule.beneficiary_ids.length.toString()],
          ['Total Amount:', `${currency} ${(schedule.amount_per_beneficiary * schedule.beneficiary_ids.length).toLocaleString()}`],
          ['Next Execution:', new Date(schedule.next_execution_date).toLocaleString()],
          ['Status:', 'Processed'],
        ];
        
        let yPos = 75;
        scheduleDetails.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 20, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(value, 80, yPos);
          yPos += 10;
        });
        
        // Payment Summary Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Accounts Paid - Summary:', 20, yPos + 15);
        
        // Enhanced beneficiaries table with more details
        const tableData = beneficiaries.map((ben, index) => [
          (index + 1).toString(),
          ben.beneficiary_name,
          ben.bank_name,
          ben.account_number,
          ben.swift_code || 'N/A',
          `${currency} ${schedule.amount_per_beneficiary.toLocaleString()}`,
          'Completed',
          new Date().toLocaleDateString()
        ]);
        
        autoTable(doc, {
          head: [['#', 'Beneficiary Name', 'Bank', 'Account', 'SWIFT', 'Amount', 'Status', 'Date']],
          body: tableData,
          startY: yPos + 25,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 35 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 25 },
            6: { cellWidth: 20 },
            7: { cellWidth: 20 }
          }
        });
        
        // Add summary at bottom
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Summary:', 20, finalY);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Payments Processed: ${beneficiaries.length}`, 20, finalY + 10);
        doc.text(`Total Amount Disbursed: ${currency} ${(schedule.amount_per_beneficiary * beneficiaries.length).toLocaleString()}`, 20, finalY + 20);
        doc.text(`Processing Date: ${new Date().toLocaleDateString()}`, 20, finalY + 30);
        
        // Legal and Banking Arbitrage Information
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Legal and Banking Arbitrage:', 20, finalY + 45);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const legalText = 'This payment is subject to banking regulations and exchange control laws. Any disputes arising from this transaction shall be subject to the jurisdiction of South African courts. Exchange rates applied are in accordance with SARB regulations. Transaction fees may apply as per our standard banking tariffs.';
        doc.text(legalText, 20, finalY + 55, { maxWidth: 170 });
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('This document serves as confirmation of bulk payment processing.', 20, finalY + 80);
        doc.text('For queries, contact TrustyBank Support at support@trustybank.com', 20, finalY + 88);
        
        doc.save(`bulk-payment-summary-${schedule.schedule_name}-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        // Individual transaction PDFs with enhanced details
        beneficiaries.forEach((beneficiary, index) => {
          if (index > 0) doc.addPage();
          
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text('PAYMENT NOTIFICATION', 105, 30, { align: 'center' });
          
          // Company header
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('TrustyBank - Payment Services', 20, 50);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text('Licensed Financial Services Provider | FSP License: [DEMO-PURPOSES-ONLY]', 20, 58);
          doc.text('Contact: +27 11 123 4567 | Email: payments@trustybank.com', 20, 66);
          
          // Transaction details
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Payment Details:', 20, 85);
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          const paymentDetails = [
            ['Payment Reference:', `TBP-${schedule.schedule_name}-${beneficiary.id.substring(0, 8)}`],
            ['Beneficiary Name:', beneficiary.beneficiary_name],
            ['Bank Name:', beneficiary.bank_name],
            ['Account Number:', beneficiary.account_number],
            ['SWIFT/Branch Code:', beneficiary.swift_code || 'N/A'],
            ['Payment Amount:', `${currency} ${schedule.amount_per_beneficiary.toLocaleString()}`],
            ['Processing Date:', new Date().toLocaleDateString()],
            ['Processing Time:', new Date().toLocaleTimeString()],
            ['Payment Status:', 'Successfully Processed'],
            ['Transaction ID:', `TXN-${Date.now()}-${index + 1}`],
          ];
          
          let yPos = 95;
          paymentDetails.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 80, yPos);
            yPos += 12;
          });
          
          // Add notification message
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Payment Notification:', 20, yPos + 20);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          
          const notificationText = `Dear ${beneficiary.beneficiary_name},\n\nThis notification confirms that a payment of ${currency} ${schedule.amount_per_beneficiary.toLocaleString()} has been processed to your account ending in ${beneficiary.account_number.slice(-4)} at ${beneficiary.bank_name}.\n\nThe payment was processed as part of the "${schedule.schedule_name}" bulk payment schedule and should reflect in your account within 1-2 business days.\n\nIf you have any questions regarding this payment, please contact us using the details provided above.`;
          
          doc.text(notificationText, 20, yPos + 35, { maxWidth: 170 });
          
          // Legal and Banking Arbitrage for individual payments
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Legal and Banking Arbitrage:', 20, yPos + 95);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const legalText = 'This payment is subject to banking regulations and exchange control laws. Any disputes arising from this transaction shall be subject to the jurisdiction of South African courts. Exchange rates applied are in accordance with SARB regulations.';
          doc.text(legalText, 20, yPos + 105, { maxWidth: 170 });
          
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text('This is an automatically generated payment notification document.', 20, yPos + 135);
          doc.text('TrustyBank - Your Trusted Financial Partner | www.trustybank.com', 20, yPos + 145);
          doc.text(`Document generated on: ${new Date().toLocaleString()}`, 20, yPos + 155);
        });
        
        doc.save(`payment-notifications-${schedule.schedule_name}-${new Date().toISOString().split('T')[0]}.pdf`);
      }
      
      toast.success(`${downloadType === 'bulk' ? 'Bulk payment summary' : 'Payment notifications'} PDF downloaded successfully`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  return (
    <Button 
      onClick={downloadPDF}
      variant="outline"
      size="sm"
      className={className}
    >
      <FileText className="h-4 w-4 mr-2" />
      Download {downloadType === 'bulk' ? 'Schedule' : 'Individual'} PDF
    </Button>
  );
};

export default BulkPaymentPDFDownloader;