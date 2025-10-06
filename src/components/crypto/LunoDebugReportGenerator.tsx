import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';

interface LunoDebugReportGeneratorProps {
  className?: string;
}

export const LunoDebugReportGenerator = ({ className }: LunoDebugReportGeneratorProps) => {
  const generateDebugReport = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPosition = 20;

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Luno API Integration Debug Report', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 20;

      // Issue Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ISSUE SUMMARY', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const issueSummary = [
        'API calls returning "403 Forbidden - Limit exceeded" error despite user having unlimited withdrawals.',
        'Integration falling back to mock transactions instead of processing real cryptocurrency sends.',
        'User account is fully verified with $600,000 send cap and unlimited withdrawals confirmed.',
        'Need clarification on production vs test API endpoints and potential rate limiting.'
      ];

      issueSummary.forEach(item => {
        const splitText = doc.splitTextToSize(`• ${item}`, pageWidth - 2 * margin);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5 + 3;
      });

      yPosition += 10;

      // Account Information
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ACCOUNT INFORMATION', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const accountInfo = [
        'Account Status: Fully verified',
        'Receiving Limits: UNLIMITED',
        'Withdrawal Limits: UNLIMITED (as per Luno support documentation)',
        'Send Cap: $600,000',
        'Region: South Africa',
        'Verification Level: Complete KYC/AML verification'
      ];

      accountInfo.forEach(item => {
        doc.text(`• ${item}`, margin, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // Technical Details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TECHNICAL DETAILS', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const technicalDetails = [
        'API Endpoint Used: https://api.luno.com/api/1/send',
        'Authentication: Basic Auth with API Key ID and Secret',
        'Request Method: POST',
        'Content-Type: application/x-www-form-urlencoded',
        'Environment Variables: LUNO_API_KEY_ID_NEW, LUNO_API_SECRET_NEW',
        'Error Response: 403 Forbidden - "Limit exceeded"'
      ];

      technicalDetails.forEach(item => {
        const splitText = doc.splitTextToSize(`• ${item}`, pageWidth - 2 * margin);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5 + 3;
      });

      yPosition += 10;

      // Recent Transaction Attempts
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RECENT TRANSACTION ATTEMPTS', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const transactions = [
        'Amount: 0.00001 BTC → Error: 403 Forbidden',
        'Amount: 0.001 BTC → Error: 403 Forbidden', 
        'Amount: 1 BTC → Error: 403 Forbidden',
        'Multiple attempts over several hours with same error',
        'All transactions falling back to mock mode'
      ];

      transactions.forEach(item => {
        doc.text(`• ${item}`, margin, yPosition);
        yPosition += 7;
      });

      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      yPosition += 10;

      // Questions for Luno Support
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('QUESTIONS FOR LUNO SUPPORT', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const questions = [
        '1. Are we using the correct production API endpoints?',
        '   - Current: https://api.luno.com/api/1/send',
        '   - Is there a different endpoint for production vs sandbox?',
        '',
        '2. API Key Configuration:',
        '   - Are our API keys configured for production or test environment?',
        '   - Do API keys have separate rate limits from account limits?',
        '   - What permissions are required for the /send endpoint?',
        '',
        '3. Rate Limiting:',
        '   - What are the API rate limits for the /send endpoint?',
        '   - Is there a daily/hourly transaction limit via API?',
        '   - How long should we wait between API calls?',
        '',
        '4. Transaction Amounts:',
        '   - Is there a minimum amount for API sends?',
        '   - Are there different limits for API vs web interface?',
        '',
        '5. Error Resolution:',
        '   - What does "Limit exceeded" specifically refer to?',
        '   - How can we identify which limit is being exceeded?',
        '   - What steps are needed to resolve this issue?'
      ];

      questions.forEach(item => {
        if (item === '') {
          yPosition += 3;
        } else {
          const splitText = doc.splitTextToSize(item, pageWidth - 2 * margin);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5 + 2;
        }
      });

      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      yPosition += 10;

      // Expected Resolution
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('EXPECTED RESOLUTION', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const resolution = [
        'Clarification on correct API configuration for production environment.',
        'Updated API credentials if current ones are sandbox/test keys.',
        'Documentation on API rate limits and best practices.',
        'Guidance on proper error handling and retry mechanisms.',
        'Confirmation that account is properly configured for API access.'
      ];

      resolution.forEach(item => {
        const splitText = doc.splitTextToSize(`• ${item}`, pageWidth - 2 * margin);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5 + 3;
      });

      yPosition += 15;

      // Contact Information
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTACT INFORMATION', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('For urgent resolution, please contact us at your earliest convenience.', margin, yPosition);
      yPosition += 7;
      doc.text('We are available to provide additional logs or technical details as needed.', margin, yPosition);

      yPosition += 15;

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('This report was generated automatically by our system.', margin, yPosition);
      doc.text('All transaction attempts were legitimate and within account limits.', margin, yPosition + 5);

      // Save the PDF
      const fileName = `luno-debug-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
      
      toast.success('Debug report generated successfully');
    } catch (error) {
      console.error('Error generating debug report:', error);
      toast.error('Failed to generate debug report');
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Luno Support Debug Report</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Generate a comprehensive debugging report to send to Luno support regarding the API integration issues.
        This report includes transaction details, error logs, and specific questions about production vs test API configuration.
      </p>
      
      <Button 
        onClick={generateDebugReport}
        className="w-full"
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" />
        Generate Debug Report PDF
      </Button>
      
      <div className="mt-3 text-xs text-muted-foreground">
        <p>Report includes:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Issue summary and error details</li>
          <li>Account verification status</li>
          <li>Technical implementation details</li>
          <li>Specific questions for API configuration</li>
          <li>Expected resolution steps</li>
        </ul>
      </div>
    </Card>
  );
};