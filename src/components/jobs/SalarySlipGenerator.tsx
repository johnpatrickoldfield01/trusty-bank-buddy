import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface TaxBreakdownItem {
  category: string;
  taxableAmount: number;
  rate: string;
  taxDue: number;
  status: 'Outstanding' | 'Estimated';
}

interface SalarySlipGeneratorProps {
  jobTitle: string;
  grossSalary: number;
  currency: string;
  formatSalary: (amount: number, currency: string) => string;
  accountDetails: {
    fnb: {
      accountHolder: string;
      accountNumber: string;
      branchCode: string;
      bankName: string;
    };
    mock: {
      accountHolder: string;
      accountNumber: string;
      bankName: string;
    };
  };
  taxBreakdown: TaxBreakdownItem[];
}

export const SalarySlipGenerator: React.FC<SalarySlipGeneratorProps> = ({
  jobTitle,
  grossSalary,
  currency,
  formatSalary,
  accountDetails,
  taxBreakdown
}) => {
  const { toast } = useToast();

  const generateSalarySlip = (accountType: 'fnb' | 'mock') => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString();
    const account = accountType === 'fnb' ? accountDetails.fnb : accountDetails.mock;
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SALARY SLIP', pageWidth / 2, 30, { align: 'center' });
    
    // Company details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Commerce Graduate Employment Program', pageWidth / 2, 45, { align: 'center' });
    pdf.text('Durban, KwaZulu-Natal, South Africa', pageWidth / 2, 55, { align: 'center' });
    
    // Employee details
    pdf.setFont('helvetica', 'bold');
    pdf.text('Employee Details:', 20, 80);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${account.accountHolder}`, 20, 95);
    pdf.text(`Position: ${jobTitle}`, 20, 105);
    pdf.text(`Pay Period: ${currentDate}`, 20, 115);
    pdf.text(`Location: Durban, ZA`, 20, 125);
    
    // Bank details
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Details:', 20, 150);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Bank: ${account.bankName}`, 20, 165);
    pdf.text(`Account Number: ${account.accountNumber}`, 20, 175);
    if (accountType === 'fnb' && accountDetails.fnb.branchCode) {
      pdf.text(`Branch Code: ${accountDetails.fnb.branchCode}`, 20, 185);
    }
    
    // Salary breakdown
    pdf.setFont('helvetica', 'bold');
    pdf.text('Salary Breakdown:', 20, 210);
    pdf.setFont('helvetica', 'normal');
    
    // Use the actual monthly gross salary passed from the parent
    const monthlySalary = grossSalary;
    const totalTax = taxBreakdown.reduce((sum, item) => sum + item.taxDue, 0);
    const monthlyTax = totalTax / 12;
    const halfMonthlyTax = monthlyTax / 2;
    const netSalary = monthlySalary; // This is already the net amount
    
    pdf.text(`Annual Salary: ${formatSalary(monthlySalary * 24, currency)}`, 20, 225); // x24 because this is half salary
    pdf.text(`Monthly Gross (50%): ${formatSalary(monthlySalary, currency)}`, 20, 235);
    pdf.text(`Tax Deduction: ${formatSalary(halfMonthlyTax, currency)}`, 20, 245);
    pdf.text(`Net Payment: ${formatSalary(netSalary, currency)}`, 20, 255);
    
    // Tax breakdown
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tax Breakdown:', 120, 210);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 225;
    taxBreakdown.forEach((tax) => {
      const monthlyTaxAmount = (tax.taxDue / 12) / 2; // Half for this account
      pdf.text(`${tax.category}: ${formatSalary(monthlyTaxAmount, currency)}`, 120, yPos);
      yPos += 10;
    });
    
    // Footer
    pdf.setFontSize(10);
    pdf.text('This is a system-generated salary slip for regulatory compliance purposes.', pageWidth / 2, 280, { align: 'center' });
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, 290, { align: 'center' });
    
    // Download
    const fileName = `salary_slip_${accountType}_${jobTitle.replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
    
    toast({
      title: "Success",
      description: `Salary slip for ${account.bankName} downloaded successfully`,
      variant: "default"
    });
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => generateSalarySlip('fnb')}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Download FNB Slip
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => generateSalarySlip('mock')}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Download Mock Slip
      </Button>
    </div>
  );
};