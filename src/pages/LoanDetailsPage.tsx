
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { useLoan } from '@/hooks/useLoan';
import { useStatementDownloader } from '@/hooks/useStatementDownloader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download } from 'lucide-react';
import { formatAccountNumber } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Profile } from '@/components/layout/AppLayout';


const LoanDetailsPage = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const { user } = useSession();
  const { loan, isLoadingLoan } = useLoan(loanId);
  const { downloadStatement } = useStatementDownloader();
  const [statementMonths, setStatementMonths] = useState(3);

  const { data: profile } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });

  const handleDownloadStatement = () => {
    if (profile && loan) {
      downloadStatement(profile, loan, statementMonths);
    }
  };

  if (isLoadingLoan) {
    return (
      <div className="container mx-auto py-8">
        <Link to="/loans" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} />
          Back to all loans
        </Link>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-1/2" />
            </div>
            <div className="border-t pt-4 space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Loan not found</h2>
        <p>The loan you are looking for does not exist or you do not have permission to view it.</p>
        <Button asChild className="mt-4">
          <Link to="/loans">Back to Loans</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Link to="/loans" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} />
        Back to all loans
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>{loan.account_name}</CardTitle>
          <CardDescription>Account Number: {loan.account_number ? formatAccountNumber(loan.account_number) : 'N/A'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold">
                R{Math.abs(Number(loan.balance)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Download Statement</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Select value={String(statementMonths)} onValueChange={(value) => setStatementMonths(Number(value))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Last 3 months</SelectItem>
                    <SelectItem value="6">Last 6 months</SelectItem>
                    <SelectItem value="12">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleDownloadStatement} disabled={!profile}>
                  <Download className="mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanDetailsPage;
