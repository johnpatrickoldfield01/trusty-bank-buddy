import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCurrencyLocation } from '@/contexts/CurrencyLocationContext';
import { cardsData } from '@/data/cards';

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
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Foreign Exchange Data
    const currencies = [
      { code: 'USD', name: 'US Dollar', balance: 1000000 },
      { code: 'EUR', name: 'Euro', balance: 1000000 },
      { code: 'JPY', name: 'Japanese Yen', balance: 1000000 },
      { code: 'GBP', name: 'British Pound', balance: 1000000 },
      { code: 'CHF', name: 'Swiss Franc', balance: 1000000 },
      { code: 'CAD', name: 'Canadian Dollar', balance: 1000000 },
      { code: 'AUD', name: 'Australian Dollar', balance: 1000000 },
      { code: 'NZD', name: 'New Zealand Dollar', balance: 1000000 },
      { code: 'CNY', name: 'Chinese Yuan', balance: 1000000 },
      { code: 'HKD', name: 'Hong Kong Dollar', balance: 1000000 },
      { code: 'SGD', name: 'Singapore Dollar', balance: 1000000 },
      { code: 'SEK', name: 'Swedish Krona', balance: 1000000 },
      { code: 'NOK', name: 'Norwegian Krone', balance: 1000000 },
      { code: 'DKK', name: 'Danish Krone', balance: 1000000 },
      { code: 'KRW', name: 'South Korean Won', balance: 1000000 },
      { code: 'INR', name: 'Indian Rupee', balance: 1000000 },
      { code: 'BRL', name: 'Brazilian Real', balance: 1000000 },
      { code: 'RUB', name: 'Russian Ruble', balance: 1000000 },
      { code: 'ZAR', name: 'South African Rand', balance: 1000000 },
      { code: 'MXN', name: 'Mexican Peso', balance: 1000000 },
    ];

    const exchangeRatesToZAR: { [key: string]: number } = {
      USD: 18.50, EUR: 20.00, JPY: 0.12, GBP: 23.50, CHF: 20.50,
      CAD: 13.50, AUD: 12.20, NZD: 11.30, CNY: 2.55, HKD: 2.37,
      SGD: 13.70, SEK: 1.75, NOK: 1.72, DKK: 2.68, KRW: 0.013,
      INR: 0.22, BRL: 3.45, RUB: 0.21, ZAR: 1.00, MXN: 1.02,
    };

    const totalFxBalance = currencies.reduce((total, currency) => {
      const rate = exchangeRatesToZAR[currency.code] || 0;
      return total + currency.balance * rate;
    }, 0);

    const checkPageBreak = (currentY: number, additionalHeight: number) => {
      if (currentY + additionalHeight > pageHeight - margin) {
        doc.addPage();
        return margin + 10;
      }
      return currentY;
    };

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
    doc.rect(margin, 60, pageWidth - 2 * margin, 40, 'F');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('TOTAL PORTFOLIO VALUE', pageWidth / 2, 75, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(0, 120, 0);
    
    // Calculate total including cards and FX
    const totalCreditLimit = cardsData.length * 1500000; // All cards have R1.5M limit
    const mainAccount = accounts?.find(acc => acc.account_type === 'main');
    const adjustedBankingTotal = totalBalance - (mainAccount?.balance || 0) + 1500000000;
    const grandTotal = adjustedBankingTotal + totalCreditLimit + totalFxBalance;
    doc.text(formatCurrency(grandTotal), pageWidth / 2, 85, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Banking: ${formatCurrency(adjustedBankingTotal)} | Credit: ${formatCurrency(totalCreditLimit)} | FX: ${formatCurrency(totalFxBalance)}`, pageWidth / 2, 95, { align: 'center' });

    let yPosition = 120;

    // Banking Assets Section
    yPosition = checkPageBreak(yPosition, 50);
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('BANKING ASSETS', margin, yPosition);
    yPosition += 10;

    const bankingData = [];
    
    // Main Account (UNREALIZED) - Fixed at R1.5B
    if (mainAccount) {
      bankingData.push([
        'Main Operating Account',
        mainAccount.account_number,
        formatCurrency(1500000000),
        'UNREALIZED',
        'Pending regulatory verification'
      ]);
    }

    // Savings Accounts (UNREALIZED)
    accounts?.filter(acc => acc.account_type === 'savings').forEach(acc => {
      bankingData.push([
        acc.account_name,
        acc.account_number,
        formatCurrency(acc.balance),
        'UNREALIZED',
        'Pending regulatory approval'
      ]);
    });

    // Loan Assets (UNREALIZED)
    accounts?.filter(acc => acc.account_type === 'loan').slice(0, 3).forEach((acc) => {
      bankingData.push([
        acc.account_name,
        acc.account_number,
        formatCurrency(Math.abs(acc.balance)),
        'UNREALIZED',
        'Collateral pending verification'
      ]);
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Asset Type', 'Account Number', 'Value', 'Status', 'Notes']],
      body: bankingData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
      columnStyles: {
        3: { fontStyle: 'bold' }
      },
      didParseCell: function(data: any) {
        if (data.column.index === 3) {
          data.cell.styles.textColor = [180, 100, 0];
          data.cell.styles.fillColor = [255, 248, 220];
        }
      }
    });

    // Get final Y position and check for page break
    const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 80;
    yPosition = checkPageBreak(finalY + 20, 100);

    // Credit Card Assets Section
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('CREDIT CARD PORTFOLIO', margin, yPosition);
    yPosition += 10;

    const creditCardData = cardsData.map((card, index) => [
      `Credit Card ${index + 1}`,
      card.cardNumber,
      formatCurrency(card.creditLimit),
      'UNREALIZED',
      'Credit facility pending activation'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Card Type', 'Card Number', 'Credit Limit', 'Status', 'Notes']],
      body: creditCardData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
      columnStyles: {
        3: { fontStyle: 'bold' }
      },
      didParseCell: function(data: any) {
        if (data.column.index === 3) {
          data.cell.styles.textColor = [180, 100, 0];
          data.cell.styles.fillColor = [255, 248, 220];
        }
      }
    });

    // Get final Y position and check for page break
    const finalY2 = (doc as any).lastAutoTable?.finalY || yPosition + 80;
    yPosition = checkPageBreak(finalY2 + 20, 100);

    // Foreign Exchange Section
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('FOREIGN EXCHANGE PORTFOLIO', margin, yPosition);
    yPosition += 10;

    const fxData = currencies.map(currency => [
      currency.code,
      currency.name,
      currency.balance.toLocaleString(),
      'UNREALIZED',
      'Pending FX compliance verification'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Currency', 'Name', 'Balance', 'Status', 'Notes']],
      body: fxData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
      columnStyles: {
        3: { fontStyle: 'bold' }
      },
      didParseCell: function(data: any) {
        if (data.column.index === 3) {
          data.cell.styles.textColor = [180, 100, 0];
          data.cell.styles.fillColor = [255, 248, 220];
        }
      }
    });

    // Get final Y position and check for page break
    const finalY3 = (doc as any).lastAutoTable?.finalY || yPosition + 80;
    yPosition = checkPageBreak(finalY3 + 20, 100);

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
          'UNREALIZED',
          'Employment contract pending verification'
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

    autoTable(doc, {
      startY: yPosition,
      head: [['Employment Asset', 'Reference', 'Annual Value', 'Status', 'Notes']],
      body: employmentData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [70, 70, 70] },
      columnStyles: {
        3: { fontStyle: 'bold' }
      },
      didParseCell: function(data: any) {
        if (data.column.index === 3) {
          data.cell.styles.textColor = [180, 100, 0];
          data.cell.styles.fillColor = [255, 248, 220];
        }
      }
    });

    // Get final Y position and check for page break
    const finalY4 = (doc as any).lastAutoTable?.finalY || yPosition + 80;
    yPosition = checkPageBreak(finalY4 + 20, 150);

    // Legal and Regulatory Information
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('LEGAL, REGULATORY & SUBMISSION FRAMEWORK', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(9);
    const legalText = [
      'ASSET CLASSIFICATION METHODOLOGY:',
      '• All assets classified as UNREALIZED pending comprehensive regulatory verification',
      '• Banking assets subject to South African Reserve Bank (SARB) compliance review',
      '• Credit facilities pending National Credit Regulator (NCR) authorization verification',
      '• Foreign exchange holdings subject to exchange control regulations compliance',
      '• Employment contracts requiring Department of Employment and Labour verification',
      '',
      'REGULATORY COMPLIANCE REQUIREMENTS:',
      '• Financial Intelligence Centre Act (FICA) compliance verification in progress',
      '• Anti-Money Laundering (AML) and Counter-Terrorism Financing (CTF) assessments pending',
      '• Tax compliance certificates from South African Revenue Service (SARS) required',
      '• Companies and Intellectual Property Commission (CIPC) entity verification ongoing',
      '',
      'ASSET REALIZATION AUTHORIZATION FRAMEWORK:',
      '• Ministerial approval required for assets exceeding R50 million threshold',
      '• Reserve Bank authorization mandatory for foreign currency asset realization',
      '• National Treasury approval required for structured financial instruments',
      '• Provincial regulatory consent needed for immovable property assets',
      '',
      'SUBMISSION PROTOCOL FOR ASSET REALIZATION ENTITIES:',
      '• Submit comprehensive due diligence documentation via registered legal representative',
      '• Provide certified copies of all regulatory licenses and authorizations',
      '• Include detailed asset valuation reports by registered professional valuers',
      '• Attach proof of adequate professional indemnity insurance coverage',
      '',
      'CONFIDENTIALITY AND SECURITY OBLIGATIONS:',
      '• This document contains confidential financial information subject to data protection laws',
      '• Recipients bound by Professional Banking Secrecy and Client Confidentiality provisions',
      '• Unauthorized disclosure constitutes violation of Financial Services Board regulations',
      '• All asset realization proposals subject to Financial Sector Conduct Authority oversight'
    ];

    legalText.forEach(line => {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin + 10;
      }
      if (line.startsWith('•')) {
        doc.text(line, margin + 5, yPosition);
      } else {
        doc.text(line, margin, yPosition);
      }
      yPosition += line === '' ? 3 : 4;
    });

    // Save the PDF
    doc.save('unrealized-asset-portfolio-summary.pdf');

    toast({
      title: "Asset Summary Generated",
      description: "Comprehensive PDF downloaded with all assets marked as unrealized pending regulatory verification.",
      variant: "default"
    });
  };

  const unrealizedAssets = [
    `Banking Accounts (${accounts?.length || 0})`,
    `Credit Card Portfolio (${cardsData.length} cards)`,
    "Foreign Exchange Holdings (20 currencies)",
    "Employment Contracts",
    "Loan Collateral Assets",
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
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">All Assets Status: UNREALIZED</h4>
            <div className="space-y-2">
              {unrealizedAssets.map((asset, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline" className="border-orange-200 text-orange-700">
                    ⏳ PENDING VERIFICATION
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
                Comprehensive PDF including all banking, credit card, and FX assets - ready for regulatory submission
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete portfolio: {cardsData.length} credit cards (R1.5M each), 20 foreign currencies, all accounts
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