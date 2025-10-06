import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

interface BankTransferError {
  id: string;
  user_id: string;
  beneficiary_id: string;
  transfer_amount: number;
  notification_sent: boolean;
  occurred_at: string;
  error_code: string;
  error_message: string;
  error_source: string;
  fix_provisions: string | null;
  beneficiaries?: {
    beneficiary_name: string;
    bank_name: string;
    account_number: string;
    swift_code: string | null;
    branch_code: string | null;
  };
}

export const BankErrorHistoryDownloader = () => {
  const [errors, setErrors] = useState<BankTransferError[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBankErrors();
  }, []);

  const fetchBankErrors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to view error history");
        return;
      }

      const { data: errorData, error: errorFetchError } = await supabase
        .from('bank_transfer_errors')
        .select('*')
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false });

      if (errorFetchError) throw errorFetchError;

      // Fetch beneficiary data for each error
      const errorsWithBeneficiaries = await Promise.all(
        (errorData || []).map(async (error) => {
          const { data: beneficiary } = await supabase
            .from('beneficiaries')
            .select('beneficiary_name, bank_name, account_number, swift_code, branch_code')
            .eq('id', error.beneficiary_id)
            .single();

          return {
            ...error,
            beneficiaries: beneficiary || undefined
          };
        })
      );

      setErrors(errorsWithBeneficiaries);
    } catch (error) {
      console.error("Error fetching bank errors:", error);
      toast.error("Failed to load error history");
    } finally {
      setLoading(false);
    }
  };

  const downloadErrorPDF = (error: BankTransferError) => {
    setDownloadingId(error.id);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Header
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Bank Database Server Error Report", margin, yPosition);
      yPosition += lineHeight * 2;

      // Error ID and Timestamp
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Error ID: ${error.id}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Occurred At: ${new Date(error.occurred_at).toLocaleString()}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Error Details Section
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("ERROR DETAILS", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Error Code: ${error.error_code}`, margin, yPosition);
      yPosition += lineHeight;
      
      pdf.text("Error Message:", margin, yPosition);
      yPosition += lineHeight;
      const errorMessageLines = pdf.splitTextToSize(error.error_message, pageWidth - (margin * 2));
      pdf.text(errorMessageLines, margin + 5, yPosition);
      yPosition += lineHeight * errorMessageLines.length + lineHeight;

      pdf.text(`Error Source: ${error.error_source}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Transaction Details Section
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("TRANSACTION DETAILS", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Transfer Amount: R ${error.transfer_amount.toFixed(2)}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Beneficiary ID: ${error.beneficiary_id}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Beneficiary Information
      if (error.beneficiaries) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("BENEFICIARY INFORMATION", margin, yPosition);
        yPosition += lineHeight * 1.5;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Name: ${error.beneficiaries.beneficiary_name}`, margin, yPosition);
        yPosition += lineHeight;
        pdf.text(`Bank: ${error.beneficiaries.bank_name}`, margin, yPosition);
        yPosition += lineHeight;
        pdf.text(`Account Number: ${error.beneficiaries.account_number}`, margin, yPosition);
        yPosition += lineHeight;
        
        if (error.beneficiaries.swift_code) {
          pdf.text(`SWIFT Code: ${error.beneficiaries.swift_code}`, margin, yPosition);
          yPosition += lineHeight;
        }
        
        if (error.beneficiaries.branch_code) {
          pdf.text(`Branch Code: ${error.beneficiaries.branch_code}`, margin, yPosition);
          yPosition += lineHeight;
        }
        yPosition += lineHeight;
      }

      // Fix Provisions
      if (error.fix_provisions) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("RECOMMENDED FIX PROVISIONS", margin, yPosition);
        yPosition += lineHeight * 1.5;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const fixLines = pdf.splitTextToSize(error.fix_provisions, pageWidth - (margin * 2));
        pdf.text(fixLines, margin, yPosition);
        yPosition += lineHeight * fixLines.length + lineHeight * 2;
      }

      // Technical Details Section
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("REQUIRED INFORMATION FROM BANK ENGINEERING", margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      const technicalQuestions = [
        "1. Database table schema verification:",
        "   _________________________________________________________________",
        "",
        "2. RLS policies affecting this beneficiary record:",
        "   _________________________________________________________________",
        "",
        "3. API endpoint validation rules:",
        "   _________________________________________________________________",
        "",
        "4. Error logging details from your system:",
        "   _________________________________________________________________",
        "",
        "5. Suggested resolution steps:",
        "   _________________________________________________________________",
        "",
      ];

      technicalQuestions.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Footer
      yPosition += lineHeight;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.text(`Notification Sent: ${error.notification_sent ? 'Yes' : 'No'}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);

      // Save PDF
      const fileName = `bank-error-${error.error_code}-${new Date(error.occurred_at).toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("Error report downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Database Error History</CardTitle>
        <CardDescription>
          Download individual PDF reports for each historic bank database server error
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No bank transfer errors found
          </p>
        ) : (
          <div className="space-y-3">
            {errors.map((error) => (
              <div
                key={error.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{error.error_code}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(error.occurred_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {error.error_message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Amount: R {error.transfer_amount.toFixed(2)}</span>
                    {error.beneficiaries && (
                      <span>To: {error.beneficiaries.beneficiary_name}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadErrorPDF(error)}
                  disabled={downloadingId === error.id}
                >
                  {downloadingId === error.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
