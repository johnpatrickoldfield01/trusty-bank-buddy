import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
        
        // Schedule details
        doc.setFontSize(14);
        doc.text('Schedule Details:', 20, 50);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const scheduleDetails = [
          ['Schedule Name:', schedule.schedule_name],
          ['Frequency:', schedule.frequency],
          ['Amount per Beneficiary:', `${currency} ${schedule.amount_per_beneficiary.toLocaleString()}`],
          ['Total Beneficiaries:', schedule.beneficiary_ids.length.toString()],
          ['Total Amount:', `${currency} ${(schedule.amount_per_beneficiary * schedule.beneficiary_ids.length).toLocaleString()}`],
          ['Next Execution:', new Date(schedule.next_execution_date).toLocaleString()],
        ];
        
        let yPos = 60;
        scheduleDetails.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 20, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(value, 80, yPos);
          yPos += 10;
        });
        
        // Beneficiaries table
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Beneficiary List:', 20, yPos + 20);
        
        const tableData = beneficiaries.map((ben, index) => [
          (index + 1).toString(),
          ben.beneficiary_name,
          ben.bank_name,
          ben.account_number,
          `${currency} ${schedule.amount_per_beneficiary.toLocaleString()}`
        ]);
        
        (doc as any).autoTable({
          head: [['#', 'Beneficiary Name', 'Bank', 'Account Number', 'Amount']],
          body: tableData,
          startY: yPos + 30,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        
        doc.save(`bulk-payment-schedule-${schedule.id}.pdf`);
      } else {
        // Individual transaction PDFs
        beneficiaries.forEach((beneficiary, index) => {
          if (index > 0) doc.addPage();
          
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text('PAYMENT CONFIRMATION', 105, 30, { align: 'center' });
          
          // Transaction details
          doc.setFontSize(14);
          doc.text('Payment Details:', 20, 60);
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          const paymentDetails = [
            ['Beneficiary:', beneficiary.beneficiary_name],
            ['Bank:', beneficiary.bank_name],
            ['Account Number:', beneficiary.account_number],
            ['SWIFT Code:', beneficiary.swift_code || 'N/A'],
            ['Amount:', `${currency} ${schedule.amount_per_beneficiary.toLocaleString()}`],
            ['Date:', new Date().toLocaleDateString()],
            ['Reference:', `${schedule.schedule_name}-${beneficiary.id.substring(0, 8)}`],
          ];
          
          let yPos = 70;
          paymentDetails.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 80, yPos);
            yPos += 10;
          });
          
          // Footer
          doc.setFontSize(10);
          doc.text('This is an automatically generated payment confirmation.', 20, 250);
          doc.text('TrustyBank - Your Trusted Financial Partner', 20, 260);
        });
        
        doc.save(`individual-payments-${schedule.id}.pdf`);
      }
      
      toast.success(`${downloadType === 'bulk' ? 'Bulk schedule' : 'Individual payment'} PDF downloaded successfully`);
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