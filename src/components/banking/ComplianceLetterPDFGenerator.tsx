import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface ComplianceError {
  id: string;
  errorCode: string;
  errorMessage: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'database' | 'compliance' | 'api' | 'regulatory';
  description: string;
  resolution: string;
  baasRequest?: string;
  timeoutCode?: number;
  lastOccurred: string;
  affectedTransfers: number;
}

interface ComplianceLetterPDFGeneratorProps {
  selectedErrors: ComplianceError[];
  onDownload?: () => void;
  className?: string;
}

const ComplianceLetterPDFGenerator = ({ 
  selectedErrors, 
  onDownload, 
  className 
}: ComplianceLetterPDFGeneratorProps) => {
  
  const generateComplianceLetter = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPos = 30;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPLIANCE & TECHNICAL REVIEW LETTER', pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;

      // Date and Reference
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
      yPos += 10;
      doc.text(`Reference: BULK-TRANSFER-${Date.now()}`, margin, yPos);
      yPos += 20;

      // Recipient
      doc.setFont('helvetica', 'bold');
      doc.text('To: Receiving Bank – Compliance & Technical Operations Team', margin, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.text('Subject: Compliance & Technical Review – Bulk Transfer Operations', margin, yPos);
      yPos += 20;

      // Section 1: Legal and Regulatory Documentation
      doc.setFont('helvetica', 'bold');
      doc.text('1. LEGAL AND REGULATORY DOCUMENTATION', margin, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      const legalText = [
        'The following identifiers may be required to complete compliance review:',
        '• NCR Number: [Pending Bank Confirmation]',
        '• FSP Number: [Pending Bank Confirmation]',
        '• Banking Licence Number: [Pending Bank Confirmation]',
        '',
        'Kindly confirm if any of these identifiers are mandatory and advise',
        'the procedure to register or provide them.'
      ];
      
      legalText.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 7;
      });
      yPos += 10;

      // Section 2: Compliance Review Blocker
      doc.setFont('helvetica', 'bold');
      doc.text('2. COMPLIANCE REVIEW BLOCKER', margin, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      const complianceText = [
        'Bulk transfers are pending full acceptance on your systems. Until compliance',
        'checks are confirmed, beneficiary balances cannot be updated.',
        `Total affected transfers: ${selectedErrors.reduce((sum, error) => sum + error.affectedTransfers, 0)}`
      ];
      
      complianceText.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 7;
      });
      yPos += 10;

      // Section 3: Technical Database Errors
      doc.setFont('helvetica', 'bold');
      doc.text('3. TECHNICAL DATABASE ERRORS', margin, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      doc.text('During processing, the following error codes were raised:', margin, yPos);
      yPos += 10;

      selectedErrors.forEach((error) => {
        // Check if we need a new page
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 30;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(`${error.errorCode} (${error.timeoutCode}):`, margin, yPos);
        yPos += 7;
        
        doc.setFont('helvetica', 'normal');
        const errorDescription = doc.splitTextToSize(error.errorMessage, pageWidth - 2 * margin);
        doc.text(errorDescription, margin + 5, yPos);
        yPos += errorDescription.length * 7;
        
        const resolution = doc.splitTextToSize(`Resolution: ${error.resolution}`, pageWidth - 2 * margin);
        doc.text(resolution, margin + 5, yPos);
        yPos += resolution.length * 7;
        
        if (error.baasRequest) {
          const baasRequest = doc.splitTextToSize(`BaaS Request: ${error.baasRequest}`, pageWidth - 2 * margin);
          doc.text(baasRequest, margin + 5, yPos);
          yPos += baasRequest.length * 7;
        }
        
        doc.text(`Affected Transfers: ${error.affectedTransfers}`, margin + 5, yPos);
        yPos += 10;
      });

      // Section 4: BaaS Arbitrage Requests
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 30;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('4. BAAS ARBITRAGE INFORMATION REQUESTS', margin, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      const baasRequests = [
        'We request your technical team provide the following for system integration:',
        '',
        'PRIMARY & FOREIGN KEY INFORMATION:',
        '• Account table primary key specifications',
        '• Foreign key constraints between transaction and account tables',
        '• Database schema for contra table mappings',
        '• Index configurations for performance optimization',
        '',
        'API CONFIGURATION DETAILS:',
        '• Authentication endpoints and token refresh procedures',
        '• Rate limiting configurations and retry policies',
        '• Webhook specifications for real-time status updates',
        '• API versioning and compatibility documentation'
      ];
      
      baasRequests.forEach(line => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 30;
        }
        doc.text(line, margin, yPos);
        yPos += 7;
      });

      // Section 5: Service Level Expectation
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('5. SERVICE-LEVEL EXPECTATION', margin, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      const serviceLevel = [
        'We request acknowledgement of this letter within 3 business days,',
        'and a proposed resolution or interim workaround within 14 days.'
      ];
      
      serviceLevel.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 7;
      });
      yPos += 10;

      // Section 6: Escalation Path
      doc.setFont('helvetica', 'bold');
      doc.text('6. ESCALATION PATH', margin, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      const escalation = [
        'If blockers cannot be resolved internally, this matter may be escalated',
        'to the South African Reserve Bank (SARB) for regulatory review.'
      ];
      
      escalation.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 7;
      });
      yPos += 20;

      // Footer
      doc.setFont('helvetica', 'bold');
      doc.text('Attachments:', margin, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('• Proof of Payment Documents (separate)', margin, yPos);
      yPos += 7;
      doc.text('• System Error Logs (available on request)', margin, yPos);
      yPos += 20;

      // Signature
      doc.text('Signed,', margin, yPos);
      yPos += 10;
      doc.text('[Your Full Name]', margin, yPos);
      yPos += 7;
      doc.text('[Your Contact Details]', margin, yPos);

      // Save the PDF
      const filename = `compliance-letter-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating compliance letter:', error);
      toast.error('Failed to generate compliance letter');
    }
  };

  return (
    <Button
      onClick={generateComplianceLetter}
      variant="outline"
      size="sm"
      className={className}
      disabled={selectedErrors.length === 0}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Compliance Letter
    </Button>
  );
};

export default ComplianceLetterPDFGenerator;