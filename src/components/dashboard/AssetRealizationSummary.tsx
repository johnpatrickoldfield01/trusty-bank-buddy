import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useCurrencyLocation } from '@/contexts/CurrencyLocationContext';

interface AssetRealizationSummaryProps {
  accounts: any[];
  salarySetups: any[];
  totalBalance: number;
}

export const AssetRealizationSummary: React.FC<AssetRealizationSummaryProps> = ({
  accounts,
  salarySetups,
  totalBalance
}) => {
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyLocation();

  const generateAssetSummaryPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('UNREALIZED ASSET PORTFOLIO SUMMARY', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Confidential Document for Asset Realization Review', pageWidth / 2, 40, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 50, { align: 'center' });

    // Summary Box
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, 60, pageWidth - 2 * margin, 30, 'F');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('TOTAL PORTFOLIO VALUE', pageWidth / 2, 75, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(0, 120, 0);
    doc.text(formatCurrency(totalBalance), pageWidth / 2, 85, { align: 'center' });

    let yPosition = 110;

    // Banking Assets Section
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('BANKING ASSETS', margin, yPosition);
    yPosition += 10;

    const bankingData = [];
    
    // Main Account (Realized)
    const mainAccount = accounts?.find(acc => acc.account_type === 'main');
    if (mainAccount) {
      bankingData.push([
        'Main Operating Account',
        mainAccount.account_number,
        formatCurrency(mainAccount.balance),
        'REALIZED',
        'Available for immediate liquidity'
      ]);
    }

    // Savings Accounts (Unrealized)
    accounts?.filter(acc => acc.account_type === 'savings').forEach(acc => {
      bankingData.push([
        acc.account_name,
        acc.account_number,
        formatCurrency(acc.balance),
        'UNREALIZED',
        'Pending regulatory approval'
      ]);
    });

    // Credit Facilities
    const creditAccounts = accounts?.filter(acc => acc.account_type === 'credit');
    if (creditAccounts?.length > 0) {
      const creditAccount = creditAccounts[0];
      bankingData.push([
        'Visa Credit Facility',
        creditAccount.account_number,
        formatCurrency(10000), // Credit limit
        'REALIZED',
        'Active credit line available'
      ]);
    }

    // Loan Assets (Unrealized)
    accounts?.filter(acc => acc.account_type === 'loan').slice(0, 2).forEach((acc, index) => {
      bankingData.push([
        acc.account_name,
        acc.account_number,
        formatCurrency(Math.abs(acc.balance)),
        'UNREALIZED',
        'Collateral pending verification'
      ]);
    });

    (doc as any).autoTable({
      startY: yPosition,
      head: [['Asset Type', 'Account Number', 'Value', 'Status', 'Notes']],
      body: bankingData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [70, 70, 70] },
      columnStyles: {
        3: { fontStyle: 'bold' }
      },
      didParseCell: function(data: any) {
        if (data.column.index === 3) {
          if (data.cell.text[0] === 'REALIZED') {
            data.cell.styles.textColor = [0, 120, 0];
            data.cell.styles.fillColor = [230, 255, 230];
          } else {
            data.cell.styles.textColor = [180, 100, 0];
            data.cell.styles.fillColor = [255, 248, 220];
          }
        }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Employment Assets Section
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('EMPLOYMENT & SALARY ASSETS', margin, yPosition);
    yPosition += 10;

    const employmentData = [];
    if (salarySetups && salarySetups.length > 0) {
      salarySetups.forEach(setup => {
        employmentData.push([
          setup.job_title,
          setup.job_id,
          formatCurrency(setup.annual_salary),
          'REALIZED',
          'Active monthly salary stream'
        ]);
      });
    } else {
      employmentData.push([
        'Future Employment Contracts',
        'N/A',
        'Variable',
        'UNREALIZED',
        'Pending contract execution'
      ]);
    }

    (doc as any).autoTable({
      startY: yPosition,
      head: [['Employment Asset', 'Reference', 'Annual Value', 'Status', 'Notes']],
      body: employmentData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [70, 70, 70] },
      columnStyles: {
        3: { fontStyle: 'bold' }
      },
      didParseCell: function(data: any) {
        if (data.column.index === 3) {
          if (data.cell.text[0] === 'REALIZED') {
            data.cell.styles.textColor = [0, 120, 0];
            data.cell.styles.fillColor = [230, 255, 230];
          } else {
            data.cell.styles.textColor = [180, 100, 0];
            data.cell.styles.fillColor = [255, 248, 220];
          }
        }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Footer Information
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('DISCLAIMER & SUBMISSION INFORMATION', margin, yPosition);
    yPosition += 8;
    
    const disclaimer = [
      'This document represents a preliminary asset portfolio assessment for realization consideration.',
      'All unrealized assets are subject to regulatory approval and due diligence verification.',
      'Realized assets are currently active and available for immediate liquidity assessment.',
      '',
      'For asset realization inquiries, please contact the portfolio holder.',
      'This document is confidential and intended solely for authorized asset realization companies.'
    ];

    disclaimer.forEach(line => {
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    // Save the PDF
    doc.save('unrealized-asset-portfolio-summary.pdf');

    toast({
      title: "Asset Summary Generated",
      description: "PDF downloaded successfully. Ready to forward to asset realization companies.",
      variant: "default"
    });
  };

  const realizedAssets = [
    "Main Operating Account",
    "Visa Credit Facility", 
    "Active Salary Streams"
  ];

  const unrealizedAssets = [
    "Savings Accounts (3)",
    "Loan Collateral Assets",
    "Future Employment Contracts",
    "Investment Portfolios"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Asset Realization Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Realized Assets</h4>
            <div className="space-y-2">
              {realizedAssets.map((asset, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    ✓ REALIZED
                  </Badge>
                  <span className="text-sm">{asset}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">Unrealized Assets</h4>
            <div className="space-y-2">
              {unrealizedAssets.map((asset, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline" className="border-orange-200 text-orange-700">
                    ⏳ PENDING
                  </Badge>
                  <span className="text-sm">{asset}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Professional PDF summary ready for asset realization companies
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Includes realized vs unrealized asset classification
              </p>
            </div>
            <Button onClick={generateAssetSummaryPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF Summary
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};