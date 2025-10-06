import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface BankEngineeringDiagnosticTemplateProps {
  className?: string;
}

export const BankEngineeringDiagnosticTemplate = ({ className }: BankEngineeringDiagnosticTemplateProps) => {
  const generateTemplate = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Header
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Bank Engineering Diagnostic Template", margin, yPosition);
      yPosition += lineHeight * 2;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text("For: Database Developer / Software Engineer / BaaS Team", margin, yPosition);
      yPosition += lineHeight * 2;

      // Section 1: Database Schema Verification
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("1. DATABASE SCHEMA VERIFICATION", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      const dbQuestions = [
        "Does the beneficiaries table exist in your schema?",
        "_____________________________________________________________________________",
        "",
        "Current table schema (provide column names, types, and constraints):",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Are there any foreign key relationships that could cause transfer failures?",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Sample SQL query to verify beneficiary data:",
        "```sql",
        "-- Please fill in your actual query",
        "",
        "",
        "```",
      ];

      dbQuestions.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight;

      // Section 2: API Endpoint Configuration
      if (yPosition > pageHeight - margin - 50) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("2. API ENDPOINT CONFIGURATION", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const apiQuestions = [
        "What is the correct API base URL for bulk payment requests?",
        "_____________________________________________________________________________",
        "",
        "Required authentication method (API Key / OAuth / JWT):",
        "_____________________________________________________________________________",
        "",
        "API rate limits (requests per minute/hour):",
        "_____________________________________________________________________________",
        "",
        "Sample API endpoint structure:",
        "```",
        "POST /api/v1/_______________________________________________",
        "Headers:",
        "  Authorization: ___________________________________________",
        "  Content-Type: ____________________________________________",
        "",
        "Request Body Structure:",
        "{",
        "  // Please provide the expected JSON structure",
        "}",
        "```",
        "",
        "Expected response format for successful transfer:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
      ];

      apiQuestions.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Section 3: Row-Level Security & Permissions
      pdf.addPage();
      yPosition = margin;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("3. ROW-LEVEL SECURITY & PERMISSIONS", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const securityQuestions = [
        "Are RLS policies enabled on payment-related tables?",
        "_____________________________________________________________________________",
        "",
        "Required user roles/permissions for bulk transfers:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Sample RLS policy that could be blocking transfers:",
        "```sql",
        "CREATE POLICY ________________________________________________",
        "",
        "",
        "```",
        "",
        "User authentication verification method:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
      ];

      securityQuestions.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight;

      // Section 4: Data Validation Rules
      if (yPosition > pageHeight - margin - 50) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("4. DATA VALIDATION RULES", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const validationQuestions = [
        "Account number format requirements:",
        "_____________________________________________________________________________",
        "",
        "SWIFT/BIC code validation rules:",
        "_____________________________________________________________________________",
        "",
        "Branch code format and validation:",
        "_____________________________________________________________________________",
        "",
        "Maximum/minimum transfer amount limits:",
        "_____________________________________________________________________________",
        "",
        "Required fields for successful transfer (please list all):",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Sample validation code snippet:",
        "```",
        "// Please provide your validation logic",
        "",
        "",
        "",
        "```",
      ];

      validationQuestions.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Section 5: Error Handling & Logging
      pdf.addPage();
      yPosition = margin;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("5. ERROR HANDLING & LOGGING", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const errorQuestions = [
        "How are transfer errors logged in your system?",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Error code definitions (please provide a mapping):",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Sample error response format:",
        "```json",
        "{",
        "  // Please provide the structure",
        "}",
        "```",
        "",
        "Are there any database triggers that could cause failures?",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Transaction rollback handling mechanism:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
      ];

      errorQuestions.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Section 6: BaaS Integration Details
      pdf.addPage();
      yPosition = margin;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("6. BAAS INTEGRATION DETAILS", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const baasQuestions = [
        "BaaS provider name and platform:",
        "_____________________________________________________________________________",
        "",
        "API documentation URL:",
        "_____________________________________________________________________________",
        "",
        "Sandbox/Test environment endpoint:",
        "_____________________________________________________________________________",
        "",
        "Production environment endpoint:",
        "_____________________________________________________________________________",
        "",
        "Webhook endpoints for payment notifications:",
        "_____________________________________________________________________________",
        "",
        "Required webhook headers/authentication:",
        "_____________________________________________________________________________",
        "",
        "Sample webhook payload structure:",
        "```json",
        "{",
        "  // Please provide the structure",
        "}",
        "```",
        "",
        "Settlement timing (immediate / batch / scheduled):",
        "_____________________________________________________________________________",
        "",
        "Compliance check requirements before transfer:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
      ];

      baasQuestions.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Section 7: Database Function Examples
      pdf.addPage();
      yPosition = margin;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("7. DATABASE FUNCTION EXAMPLES", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const functionQuestions = [
        "Provide the SQL function used for bulk transfers:",
        "```sql",
        "CREATE OR REPLACE FUNCTION _______________________________________",
        "",
        "",
        "",
        "",
        "",
        "```",
        "",
        "Provide any stored procedures related to payment processing:",
        "```sql",
        "",
        "",
        "",
        "```",
        "",
        "Database indexes on payment/beneficiary tables:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
      ];

      functionQuestions.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Section 8: Compliance & Regulatory
      pdf.addPage();
      yPosition = margin;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("8. COMPLIANCE & REGULATORY REQUIREMENTS", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const complianceQuestions = [
        "KYC verification requirements for beneficiaries:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "AML (Anti-Money Laundering) checks performed:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Transaction monitoring thresholds:",
        "_____________________________________________________________________________",
        "",
        "Required documentation for proof of payment:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Regulatory reporting requirements:",
        "_____________________________________________________________________________",
        "_____________________________________________________________________________",
        "",
        "Data retention policies:",
        "_____________________________________________________________________________",
      ];

      complianceQuestions.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Section 9: Contact & Support
      pdf.addPage();
      yPosition = margin;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("9. TECHNICAL CONTACT INFORMATION", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const contactQuestions = [
        "Database Administrator Name:",
        "_____________________________________________________________________________",
        "",
        "Database Administrator Email:",
        "_____________________________________________________________________________",
        "",
        "API Integration Engineer Name:",
        "_____________________________________________________________________________",
        "",
        "API Integration Engineer Email:",
        "_____________________________________________________________________________",
        "",
        "Technical Support Ticket System URL:",
        "_____________________________________________________________________________",
        "",
        "Escalation contact for urgent issues:",
        "_____________________________________________________________________________",
        "",
        "Preferred method of communication (Email / Slack / Teams / Other):",
        "_____________________________________________________________________________",
        "",
        "Response time SLA:",
        "_____________________________________________________________________________",
      ];

      contactQuestions.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Footer
      yPosition += lineHeight * 2;
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.text("Please fill out this template and return it along with any relevant code samples,", margin, yPosition);
      yPosition += lineHeight;
      pdf.text("API documentation, and database schema diagrams to assist with troubleshooting.", margin, yPosition);

      // Save the PDF
      const fileName = `bank-engineering-diagnostic-template-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("Bank engineering diagnostic template downloaded successfully");
    } catch (error) {
      console.error("Error generating template:", error);
      toast.error("Failed to generate template");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Bank Engineering Diagnostic Template</CardTitle>
        <CardDescription>
          Generate a fillable PDF template for bank database developers and software engineers
          to provide technical details about payment processing, API integration, and compliance requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Template Sections Include:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Database Schema Verification</li>
              <li>API Endpoint Configuration</li>
              <li>Row-Level Security & Permissions</li>
              <li>Data Validation Rules</li>
              <li>Error Handling & Logging</li>
              <li>BaaS Integration Details</li>
              <li>Database Function Examples</li>
              <li>Compliance & Regulatory Requirements</li>
              <li>Technical Contact Information</li>
            </ul>
          </div>

          <Button 
            onClick={generateTemplate}
            className="w-full"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download Bank Engineering Template (PDF)
          </Button>

          <p className="text-xs text-muted-foreground">
            Send this template to your bank's engineering team to gather technical details
            needed for troubleshooting bulk payment and BaaS integration issues.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
