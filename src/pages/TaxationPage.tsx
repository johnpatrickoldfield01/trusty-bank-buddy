import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { type Profile } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { useTaxCalculations } from '@/hooks/useTaxCalculations';
import { useDashboardData } from '@/hooks/useDashboardData';
import StatCard from '@/components/ui/StatCard';

const TaxationPage = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();
  const { 
    totalBalance, 
    mainAccountBalance, 
    savingsBalance, 
    creditCardBalance,
    isLoadingAccounts 
  } = useDashboardData();
  
  const {
    totalTaxableIncome,
    incomeTax,
    capitalGainsTax,
    cryptoTaxLiability,
    totalTaxLiability,
    taxBreakdown,
    isLoading
  } = useTaxCalculations({ totalBalance, mainAccountBalance, savingsBalance, creditCardBalance });

  if (isLoading || isLoadingAccounts) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Tax Assessment & Calculations</h1>
      </div>
      
      <p className="text-muted-foreground">
        Simulated taxation summary based on your banking and cryptocurrency holdings. 
        These calculations are estimates for demonstration purposes only.
      </p>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tax Liability"
          value={`R ${totalTaxLiability.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`}
          icon={<AlertTriangle className="h-5 w-5" />}
          className="border-destructive/20"
        />
        <StatCard
          title="Income Tax"
          value={`R ${incomeTax.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Capital Gains Tax"
          value={`R ${capitalGainsTax.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Crypto Tax Liability"
          value={`R ${cryptoTaxLiability.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`}
          icon={<Calculator className="h-5 w-5" />}
        />
      </div>

      {/* Detailed Tax Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tax Calculation Breakdown
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of tax calculations based on South African tax regulations (simulated)
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Category</TableHead>
                <TableHead>Taxable Amount (R)</TableHead>
                <TableHead>Tax Rate</TableHead>
                <TableHead className="text-right">Tax Due (R)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxBreakdown.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="font-mono">
                    {item.taxableAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.rate}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {item.taxDue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.status === 'Outstanding' ? 'destructive' : 'default'}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Information Notice */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Important Tax Notice
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                These tax calculations are simulated estimates for demonstration purposes only. 
                Actual tax obligations may vary significantly based on numerous factors including 
                income sources, deductions, exemptions, and current tax legislation. Always consult 
                with a qualified tax professional or the South African Revenue Service (SARS) for 
                accurate tax advice and obligations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxationPage;