import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export const CryptoErrorDiagnosticTemplate = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDFTemplate = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CRYPTOCURRENCY TRANSACTION DIAGNOSTIC TEMPLATE', margin, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
      doc.text('Status: AWAITING ENGINEERING TEAM RESPONSE', margin, yPos + 5);

      yPos += 15;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // SECTION 1: LUNO ENGINEERING TEAM
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('SECTION 1: LUNO ENGINEERING TEAM', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('1.1 API Rate Limit Configuration', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Current rate limit (requests/minute): _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Burst allowance: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Rate limit reset window: _________________', margin + 5, yPos);
      yPos += 8;

      // Sample code snippet
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.setFillColor(245, 245, 245);
      doc.rect(margin + 5, yPos - 3, maxWidth - 10, 15, 'F');
      doc.text('// Sample API Response Headers', margin + 8, yPos);
      yPos += 4;
      doc.text('X-RateLimit-Limit: _________________', margin + 8, yPos);
      yPos += 4;
      doc.text('X-RateLimit-Remaining: _________________', margin + 8, yPos);
      yPos += 4;
      doc.text('X-RateLimit-Reset: _________________', margin + 8, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('1.2 Transaction Processing Status', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Transaction ID verification method: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Average processing time: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Blockchain confirmation requirements: _________________', margin + 5, yPos);
      yPos += 8;

      // Code snippet for transaction status
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.setFillColor(245, 245, 245);
      doc.rect(margin + 5, yPos - 3, maxWidth - 10, 20, 'F');
      doc.text('// Sample Transaction Status Response', margin + 8, yPos);
      yPos += 4;
      doc.text('{', margin + 8, yPos);
      yPos += 4;
      doc.text('  "transaction_id": "_________________",', margin + 8, yPos);
      yPos += 4;
      doc.text('  "status": "_________________",', margin + 8, yPos);
      yPos += 4;
      doc.text('  "confirmations": _________________', margin + 8, yPos);
      yPos += 4;
      doc.text('}', margin + 8, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('1.3 Error Code Documentation', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Error code encountered: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Official error description: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Recommended resolution: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Escalation contact: _________________', margin + 5, yPos);

      // NEW PAGE - BLOCKCHAIN TEAM
      doc.addPage();
      yPos = 20;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('SECTION 2: BLOCKCHAIN ENGINEERING TEAM', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('2.1 Transaction Hash Verification', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Transaction hash: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Block explorer URL: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Is transaction visible on blockchain? [ ] Yes [ ] No', margin + 5, yPos);
      yPos += 5;
      doc.text('If no, estimated time until visible: _________________', margin + 5, yPos);
      yPos += 8;

      // Blockchain verification code
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.setFillColor(245, 245, 245);
      doc.rect(margin + 5, yPos - 3, maxWidth - 10, 25, 'F');
      doc.text('// Blockchain Verification Query', margin + 8, yPos);
      yPos += 4;
      doc.text('GET /api/v1/transaction/{txHash}', margin + 8, yPos);
      yPos += 4;
      doc.text('Response:', margin + 8, yPos);
      yPos += 4;
      doc.text('{', margin + 8, yPos);
      yPos += 4;
      doc.text('  "exists": _________________,', margin + 8, yPos);
      yPos += 4;
      doc.text('  "confirmations": _________________,', margin + 8, yPos);
      yPos += 4;
      doc.text('  "timestamp": "_________________"', margin + 8, yPos);
      yPos += 4;
      doc.text('}', margin + 8, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('2.2 Network Status', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Network congestion level: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Current gas/fee rate: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Mempool status: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Any known network issues? _________________', margin + 5, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('2.3 Address Validation', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Recipient address: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Address format valid? [ ] Yes [ ] No', margin + 5, yPos);
      yPos += 5;
      doc.text('Address checksum valid? [ ] Yes [ ] No', margin + 5, yPos);
      yPos += 5;
      doc.text('Network compatibility: _________________', margin + 5, yPos);

      // NEW PAGE - BANK INTEGRATION TEAM
      doc.addPage();
      yPos = 20;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('SECTION 3: BANK INTEGRATION TEAM', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('3.1 Bank Account Verification', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Account holder name: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Account number: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Bank name: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('SWIFT/BIC code: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Account status: [ ] Active [ ] Frozen [ ] Under Review', margin + 5, yPos);
      yPos += 8;

      // Bank API extraction code
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.setFillColor(245, 245, 245);
      doc.rect(margin + 5, yPos - 3, maxWidth - 10, 30, 'F');
      doc.text('// Bank Account Extraction API', margin + 8, yPos);
      yPos += 4;
      doc.text('POST /api/v1/extract-account-details', margin + 8, yPos);
      yPos += 4;
      doc.text('Authorization: Bearer _________________', margin + 8, yPos);
      yPos += 4;
      doc.text('Request Body:', margin + 8, yPos);
      yPos += 4;
      doc.text('{', margin + 8, yPos);
      yPos += 4;
      doc.text('  "account_number": "_________________",', margin + 8, yPos);
      yPos += 4;
      doc.text('  "bank_code": "_________________",', margin + 8, yPos);
      yPos += 4;
      doc.text('  "country": "_________________"', margin + 8, yPos);
      yPos += 4;
      doc.text('}', margin + 8, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('3.2 Compliance & KYC Status', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('KYC verification status: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('AML screening result: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Transaction limit: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Any compliance flags? _________________', margin + 5, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('3.3 Settlement & Reconciliation', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Expected settlement date: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Actual settlement date: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Reconciliation status: [ ] Matched [ ] Pending [ ] Discrepancy', margin + 5, yPos);
      yPos += 5;
      doc.text('Reference number: _________________', margin + 5, yPos);

      // NEW PAGE - CRITICAL ISSUES & RESOLUTION
      doc.addPage();
      yPos = 20;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(234, 88, 12);
      doc.text('SECTION 4: CRITICAL ISSUES & RESOLUTION PATH', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('4.1 Root Cause Analysis', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Primary issue identified:', margin + 5, yPos);
      yPos += 5;
      doc.text('_________________________________________________________________', margin + 5, yPos);
      yPos += 5;
      doc.text('_________________________________________________________________', margin + 5, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Contributing factors:', margin + 5, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('_________________________________________________________________', margin + 5, yPos);
      yPos += 5;
      doc.text('_________________________________________________________________', margin + 5, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('4.2 Immediate Action Items', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('[ ] Luno Team Action: _____________________________________________', margin + 5, yPos);
      yPos += 5;
      doc.text('    Assigned to: _________________ Due: _________________', margin + 5, yPos);
      yPos += 8;
      doc.text('[ ] Blockchain Team Action: ______________________________________', margin + 5, yPos);
      yPos += 5;
      doc.text('    Assigned to: _________________ Due: _________________', margin + 5, yPos);
      yPos += 8;
      doc.text('[ ] Bank Team Action: ____________________________________________', margin + 5, yPos);
      yPos += 5;
      doc.text('    Assigned to: _________________ Due: _________________', margin + 5, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('4.3 Long-term Resolution', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Proposed solution:', margin + 5, yPos);
      yPos += 5;
      doc.text('_________________________________________________________________', margin + 5, yPos);
      yPos += 5;
      doc.text('_________________________________________________________________', margin + 5, yPos);
      yPos += 8;
      doc.text('Timeline for implementation: _________________', margin + 5, yPos);
      yPos += 5;
      doc.text('Testing requirements: _________________', margin + 5, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('4.4 Sign-off & Approval', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Luno Engineering Lead: _____________________ Date: __________', margin + 5, yPos);
      yPos += 6;
      doc.text('Blockchain Engineer: _____________________ Date: __________', margin + 5, yPos);
      yPos += 6;
      doc.text('Bank Integration Lead: _____________________ Date: __________', margin + 5, yPos);
      yPos += 10;

      // Footer
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('CONFIDENTIAL - For Internal Engineering Use Only', margin, yPos);
      doc.text(`Report ID: CRYPTO-DIAG-${Date.now()}`, pageWidth - margin - 60, yPos);

      // Save PDF
      const filename = `Crypto_Diagnostic_Template_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast.success('Diagnostic template generated successfully');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <FileText className="w-8 h-8 text-primary mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            Engineering Team Diagnostic Template
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a comprehensive template for Luno, Blockchain, and Bank engineering teams
            to fill in technical details about cryptocurrency transaction errors.
          </p>
          
          <div className="space-y-2 text-sm mb-4">
            <p className="font-medium">Template includes:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Luno API rate limits and transaction processing details</li>
              <li>Blockchain verification queries and network status</li>
              <li>Bank account extraction API examples</li>
              <li>Sample code snippets for each integration point</li>
              <li>Structured fields for root cause analysis</li>
              <li>Action item tracking with assignments and deadlines</li>
            </ul>
          </div>

          <Button 
            onClick={generatePDFTemplate}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating Template...' : 'Generate PDF Template'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
