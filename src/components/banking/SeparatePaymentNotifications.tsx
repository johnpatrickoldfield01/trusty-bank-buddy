import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface BulkPaymentSchedule {
  id: string;
  schedule_name: string;
  beneficiary_ids: string[];
  amount_per_beneficiary: number;
  frequency: string;
  next_execution_date: string;
  currency?: string;
}

interface SeparatePaymentNotificationsProps {
  schedule: BulkPaymentSchedule;
  beneficiaries: any[];
  className?: string;
}

const SeparatePaymentNotifications = ({ schedule, beneficiaries, className }: SeparatePaymentNotificationsProps) => {
  const downloadSeparatePDFs = () => {
    try {
      const currency = schedule.currency || 'ZAR';
      let filesGenerated = 0;

      beneficiaries.forEach((beneficiary, index) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT NOTIFICATION', 105, 30, { align: 'center' });
        
        // Company header with enhanced branding
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TrustyBank - Payment Services Division', 20, 45);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Licensed Financial Services Provider | FSP License: 12345', 20, 52);
        doc.text('Head Office: 123 Financial Street, Cape Town | Tel: +27 21 123 4567', 20, 59);
        doc.text('Email: notifications@trustybank.com | Web: www.trustybank.com', 20, 66);
        
        // Add line separator
        doc.setLineWidth(0.5);
        doc.line(20, 72, 190, 72);
        
        // Payment notification details
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Notification Details:', 20, 85);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const notificationDetails = [
          ['Reference Number:', `TBP-${schedule.schedule_name}-${beneficiary.id.substring(0, 8)}`],
          ['Beneficiary Name:', beneficiary.beneficiary_name],
          ['Bank Institution:', beneficiary.bank_name],
          ['Account Number:', beneficiary.account_number],
          ['SWIFT/Branch Code:', beneficiary.swift_code || beneficiary.branch_code || 'N/A'],
          ['Payment Amount:', `${currency} ${schedule.amount_per_beneficiary.toLocaleString()}`],
          ['Processing Date:', new Date().toLocaleDateString()],
          ['Processing Time:', new Date().toLocaleTimeString()],
          ['Payment Status:', 'Successfully Processed'],
          ['Transaction ID:', `TXN-${Date.now()}-${String(index + 1).padStart(4, '0')}`],
          ['Batch Reference:', schedule.schedule_name],
        ];
        
        let yPos = 95;
        notificationDetails.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 20, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(value, 90, yPos);
          yPos += 8;
        });
        
        // Banking details section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Banking Information:', 20, yPos + 15);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        const bankingInfo = `
Dear ${beneficiary.beneficiary_name},

This notification serves to confirm that a payment has been successfully processed to your account.

PAYMENT SUMMARY:
• Amount: ${currency} ${schedule.amount_per_beneficiary.toLocaleString()}
• Destination: ${beneficiary.bank_name} (Account: ***${beneficiary.account_number.slice(-4)})
• Expected Clearing: 1-2 business days for domestic transfers
• Batch Processing: ${schedule.schedule_name}

IMPORTANT NOTES:
• This payment was processed as part of our bulk payment system
• Please allow 1-2 business days for the funds to reflect in your account
• For SWIFT transfers, allow 3-5 business days for international processing
• Please retain this notification for your records

Should you have any queries regarding this payment, please contact our Payment Services team using the contact details provided above.

Thank you for banking with TrustyBank.`;

        doc.text(bankingInfo, 20, yPos + 25, { maxWidth: 170 });
        
        // Footer with legal and compliance information
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('LEGAL & COMPLIANCE NOTICE:', 20, 250);
        doc.text('This document is generated in compliance with banking regulations and serves as official payment notification.', 20, 258);
        doc.text('TrustyBank is regulated by the South African Reserve Bank (SARB) and registered with the Financial Sector Conduct Authority.', 20, 266);
        doc.text(`Document generated: ${new Date().toLocaleString()} | Retention required: 7 years as per banking regulations`, 20, 274);
        
        // Save individual PDF
        const fileName = `payment-notification-${beneficiary.beneficiary_name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        filesGenerated++;
      });
      
      toast.success(`${filesGenerated} separate payment notification PDFs downloaded successfully`);
    } catch (error) {
      console.error('Error generating separate PDFs:', error);
      toast.error('Failed to download separate payment notifications');
    }
  };

  return (
    <Button 
      onClick={downloadSeparatePDFs}
      variant="outline"
      size="sm"
      className={className}
    >
      <FileText className="h-4 w-4 mr-2" />
      Download Separate Notifications ({beneficiaries.length} files)
    </Button>
  );
};

export default SeparatePaymentNotifications;