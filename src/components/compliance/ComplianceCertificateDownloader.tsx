import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Shield } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ComplianceCertificateProps {
  transactionData: {
    amount: number;
    currency: string;
    recipientName: string;
    transactionDate: string;
    transactionId: string;
  };
  className?: string;
}

const ComplianceCertificateDownloader = ({ transactionData, className }: ComplianceCertificateProps) => {
  const downloadCertificate = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('BANKING COMPLIANCE CERTIFICATE', 105, 30, { align: 'center' });
      
      // Compliance badge
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Certified by: TrustyBank Compliance Department', 105, 45, { align: 'center' });
      
      // Transaction details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Details:', 20, 70);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const details = [
        ['Transaction ID:', transactionData.transactionId],
        ['Amount:', `${transactionData.currency} ${transactionData.amount.toLocaleString()}`],
        ['Recipient:', transactionData.recipientName],
        ['Date:', new Date(transactionData.transactionDate).toLocaleDateString()],
        ['Compliance Status:', 'VERIFIED ✓'],
      ];
      
      let yPos = 80;
      details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 80, yPos);
        yPos += 10;
      });
      
      // Compliance statements
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Regulatory Compliance:', 20, 150);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const complianceText = [
        '• Anti-Money Laundering (AML) compliance verified',
        '• Know Your Customer (KYC) requirements met',
        '• South African Reserve Bank (SARB) regulations adhered to',
        '• Financial Intelligence Centre Act (FICA) compliance confirmed',
        '• Cross-border transaction reporting completed',
        '• Tax compliance certificate attached'
      ];
      
      yPos = 160;
      complianceText.forEach(text => {
        doc.text(text, 20, yPos);
        yPos += 8;
      });
      
      // Legal arbitrage section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Legal Arbitrage Framework:', 20, 220);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const legalText = [
        'This transaction is governed by South African banking law and international',
        'banking regulations. Any disputes shall be resolved through the Banking',
        'Ombudsman or appropriate legal channels as per the National Credit Act.'
      ];
      
      yPos = 230;
      legalText.forEach(text => {
        doc.text(text, 20, yPos);
        yPos += 6;
      });
      
      // Footer
      doc.setFontSize(8);
      doc.text('Certificate generated on: ' + new Date().toLocaleString(), 20, 270);
      doc.text('TrustyBank - Authorized Financial Services Provider', 20, 280);
      
      doc.save(`compliance-certificate-${transactionData.transactionId}.pdf`);
      toast.success('Compliance certificate downloaded successfully');
    } catch (error) {
      console.error('Error generating compliance certificate:', error);
      toast.error('Failed to download compliance certificate');
    }
  };

  return (
    <Button 
      onClick={downloadCertificate}
      variant="outline"
      size="sm"
      className={className}
    >
      <Shield className="h-4 w-4 mr-2" />
      Download Compliance Certificate
    </Button>
  );
};

export default ComplianceCertificateDownloader;