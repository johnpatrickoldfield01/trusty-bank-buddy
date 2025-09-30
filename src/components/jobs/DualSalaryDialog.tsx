import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Download, Building2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccounts } from '@/hooks/useAccounts';
import { useSession } from '@/hooks/useSession';
import { useTaxCalculations } from '@/hooks/useTaxCalculations';
import { supabase } from '@/integrations/supabase/client';
import { SalarySlipGenerator } from './SalarySlipGenerator';

interface DualSalaryDialogProps {
  job: {
    id: string;
    title: string;
    expected_salary_min: number;
    expected_salary_max: number;
    currency: string;
    location: string;
    job_categories?: { name: string };
  };
  selectedCurrency: string;
  convertSalary: (amount: number, from: string, to: string) => number;
  formatSalary: (amount: number, currency: string) => string;
}

export const DualSalaryDialog: React.FC<DualSalaryDialogProps> = ({
  job,
  selectedCurrency,
  convertSalary,
  formatSalary
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fnbDetails, setFnbDetails] = useState({
    accountHolder: '',
    accountNumber: '',
    branchCode: '',
    bankName: 'FNB'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState(job.expected_salary_max);
  const [hasSalarySetup, setHasSalarySetup] = useState(false);
  
  const { toast } = useToast();
  const { user } = useSession();
  const { accounts, refreshAccounts } = useAccounts();
  const { taxBreakdown } = useTaxCalculations({
    totalBalance: accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0,
    mainAccountBalance: accounts?.find(acc => acc.account_type === 'main')?.balance || 0,
    savingsBalance: accounts?.find(acc => acc.account_type === 'savings')?.balance || 0,
    creditCardBalance: accounts?.find(acc => acc.account_type === 'credit')?.balance || 0
  });

  const handleSetupDualSalary = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to set up dual salary",
        variant: "destructive"
      });
      return;
    }

    if (!fnbDetails.accountHolder || !fnbDetails.accountNumber || !fnbDetails.branchCode) {
      toast({
        title: "Error",
        description: "Please fill in all FNB account details",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create a new mock account for the second salary
      const mockAccountNumber = `MOCK${Date.now().toString().slice(-8)}`;
      
      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          account_name: `${job.title} Salary Account`,
          account_type: 'savings',
          account_number: mockAccountNumber,
          balance: 0
        })
        .select()
        .single();

      if (accountError) throw accountError;

      // Create beneficiary record for FNB account
      const { error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .insert({
          user_id: user.id,
          beneficiary_name: fnbDetails.accountHolder,
          bank_name: fnbDetails.bankName,
          account_number: fnbDetails.accountNumber,
          branch_code: fnbDetails.branchCode,
          beneficiary_email: user.email || '',
          kyc_verified: true
        });

      if (beneficiaryError) throw beneficiaryError;

      // Calculate monthly salary amount
      const monthlySalary = salaryAmount / 12;
      const totalTax = taxBreakdown.reduce((sum, item) => sum + item.taxDue, 0);
      const monthlyTaxDeduction = totalTax / 12;
      const netMonthlySalary = monthlySalary - monthlyTaxDeduction;

      // Create payment schedule for both accounts
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);

      // Record salary setup
      const { error: salarySetupError } = await supabase
        .from('job_salary_setups')
        .insert([{
          user_id: user.id,
          job_id: job.id,
          job_title: job.title,
          annual_salary: salaryAmount,
          monthly_gross: monthlySalary,
          monthly_net: netMonthlySalary,
          fnb_account_holder: fnbDetails.accountHolder,
          fnb_account_number: fnbDetails.accountNumber,
          fnb_branch_code: fnbDetails.branchCode,
          mock_account_id: newAccount.id,
          next_payment_date: nextMonth.toISOString(),
          is_active: true,
          auto_email_enabled: true
        }]);

      if (salarySetupError) throw salarySetupError;

      // Send initial email notification
      await supabase.functions.invoke('send-salary-notification', {
        body: {
          userEmail: user.email,
          jobTitle: job.title,
          monthlySalary: formatSalary(netMonthlySalary / 2, selectedCurrency),
          setupComplete: true
        }
      });

      toast({
        title: "Success",
        description: `Dual salary setup completed! Monthly payments of ${formatSalary(netMonthlySalary / 2, selectedCurrency)} will be sent to each account.`,
        variant: "default"
      });

      setHasSalarySetup(true);
      refreshAccounts();
      setIsOpen(false);
    } catch (error) {
      console.error('Error setting up dual salary:', error);
      toast({
        title: "Error",
        description: "Failed to set up dual salary system",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const convertedSalary = convertSalary(salaryAmount, job.currency, selectedCurrency);
  const monthlySalary = convertedSalary / 12;
  const halfSalary = monthlySalary / 2;

  // Calculate tax deductions
  const totalTax = taxBreakdown.reduce((sum, item) => sum + item.taxDue, 0);
  const monthlyTaxDeduction = totalTax / 12;
  const netMonthlySalary = monthlySalary - monthlyTaxDeduction;
  const netHalfSalary = netMonthlySalary / 2;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="ml-2">
          <DollarSign className="h-4 w-4 mr-1" />
          Dual Salary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Up Dual Salary System</DialogTitle>
          <DialogDescription>
            Configure automatic monthly salary payments to two accounts for {job.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Salary Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Annual Salary Amount</Label>
                <Input
                  type="number"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Range: {formatSalary(convertSalary(job.expected_salary_min, job.currency, selectedCurrency), selectedCurrency)} - {formatSalary(convertSalary(job.expected_salary_max, job.currency, selectedCurrency), selectedCurrency)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Gross Monthly</p>
                  <p className="text-lg font-semibold">{formatSalary(monthlySalary, selectedCurrency)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Tax Deduction</p>
                  <p className="text-lg font-semibold text-red-600">-{formatSalary(monthlyTaxDeduction, selectedCurrency)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Monthly</p>
                  <p className="text-lg font-semibold text-green-600">{formatSalary(netMonthlySalary, selectedCurrency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account 1: FNB Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Account 1: FNB Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Account Holder Name</Label>
                  <Input
                    value={fnbDetails.accountHolder}
                    onChange={(e) => setFnbDetails({ ...fnbDetails, accountHolder: e.target.value })}
                    placeholder="Full name as on bank account"
                  />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={fnbDetails.accountNumber}
                    onChange={(e) => setFnbDetails({ ...fnbDetails, accountNumber: e.target.value })}
                    placeholder="FNB account number"
                  />
                </div>
                <div>
                  <Label>Branch Code</Label>
                  <Input
                    value={fnbDetails.branchCode}
                    onChange={(e) => setFnbDetails({ ...fnbDetails, branchCode: e.target.value })}
                    placeholder="250655"
                  />
                </div>
                <div>
                  <Label>Bank Name</Label>
                  <Input value="FNB" disabled />
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold">Monthly Payment to FNB:</p>
                <p className="text-lg">{formatSalary(netHalfSalary, selectedCurrency)}</p>
                <Badge variant="outline" className="mt-2">Downloadable Salary Slip</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Account 2: Mock Account */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account 2: New Mock Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 rounded-lg space-y-2">
                <p className="font-semibold">Mock Account Details:</p>
                <p>Account Name: {job.title} Salary Account</p>
                <p>Account Number: Will be generated automatically</p>
                <p>Bank: Mock Banking System</p>
                <p className="text-lg font-semibold">Monthly Payment: {formatSalary(netHalfSalary, selectedCurrency)}</p>
                <Badge variant="outline" className="mt-2">Downloadable Salary Slip</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSetupDualSalary} 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Setting up...' : 'Set Up Dual Salary System'}
            </Button>
            
            <SalarySlipGenerator
              jobTitle={job.title}
              grossSalary={monthlySalary}
              currency={selectedCurrency}
              formatSalary={formatSalary}
              accountDetails={{
                fnb: fnbDetails,
                mock: {
                  accountHolder: user?.email || 'User',
                  accountNumber: 'MOCK12345678',
                  bankName: 'Mock Banking System'
                }
              }}
              taxBreakdown={taxBreakdown}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};