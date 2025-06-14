
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { useStatementDownloader } from '@/hooks/useStatementDownloader';
import { useAccountConfirmationDownloader } from '@/hooks/useAccountConfirmationDownloader';
import { useCashflowForecastDownloader } from '@/hooks/useCashflowForecastDownloader';
import { useBalanceSheetDownloader } from '@/hooks/useBalanceSheetDownloader';
import { type LocalTransferFormValues } from '@/schemas/localTransferSchema';
import { type Profile } from '@/components/layout/AppLayout';

interface DashboardActionsProps {
  profile: Profile | null;
  accounts: any[] | undefined;
  totalBalance: number;
  mainAccountBalance: number;
  savingsBalance: number;
  creditCardBalance: number;
  businessLoanBalance: number;
  homeLoanBalance: number;
  mainAccount: any | undefined;
}

export const useDashboardActions = ({
  profile,
  accounts,
  totalBalance,
  mainAccountBalance,
  savingsBalance,
  creditCardBalance,
  businessLoanBalance,
  homeLoanBalance,
  mainAccount,
}: DashboardActionsProps) => {
  const navigate = useNavigate();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { downloadStatement } = useStatementDownloader();
  const { downloadCashflowForecast } = useCashflowForecastDownloader();
  const { downloadBalanceSheet } = useBalanceSheetDownloader();
  const { downloadAccountConfirmation } = useAccountConfirmationDownloader();

  const handleSendMoney = async ({ amount, recipientName }: { amount: number; recipientName: string }) => {
    if (!user) {
        toast.error("You must be logged in to send money.");
        throw new Error("User not logged in.");
    }
    
    if (!accounts) {
        toast.error("Could not fetch account details.");
        throw new Error("No accounts found");
    }

    const senderMainAccount = accounts.find(acc => acc.account_type === 'main');

    if (!senderMainAccount) {
      toast.error("Main account not found.");
      throw new Error("Main account not found.");
    }
    if (senderMainAccount.balance < amount) {
        toast.error("Insufficient funds.");
        throw new Error("Insufficient funds.");
    }

    const { error } = await supabase.rpc('transfer_money', {
      sender_account_id: senderMainAccount.id,
      recipient_name: recipientName,
      transfer_amount: amount
    });

    if (error) {
      toast.error(`Transaction failed: ${error.message}`);
      throw error;
    }

    await queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['monthlySpending', user?.id] });
  };

  const handleLocalTransfer = async (values: LocalTransferFormValues) => {
    if (!user) {
        toast.error("You must be logged in to send money.");
        throw new Error("User not logged in.");
    }
    
    if (!accounts) {
        toast.error("Could not fetch account details.");
        throw new Error("No accounts found");
    }

    const senderMainAccount = accounts.find(acc => acc.account_type === 'main');

    if (!senderMainAccount) {
      toast.error("Main account not found.");
      throw new Error("Main account not found.");
    }
    if (senderMainAccount.balance < values.amount) {
        toast.error("Insufficient funds.");
        throw new Error("Insufficient funds.");
    }

    const { error } = await supabase.rpc('transfer_money', {
      sender_account_id: senderMainAccount.id,
      recipient_name: values.accountHolderName,
      transfer_amount: values.amount
    });

    if (error) {
      toast.error(`Transaction failed: ${error.message}`);
      throw error;
    }

    await queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    await queryClient.invalidateQueries({ queryKey: ['monthlySpending', user?.id] });
  };

  const handleDownloadStatement = () => {
    downloadStatement(profile, mainAccount, 3);
  };

  const handleDownload12MonthStatement = () => {
    downloadStatement(profile, mainAccount, 12);
  };

  const handleDownloadCashflowForecast = () => {
    downloadCashflowForecast(profile, totalBalance);
  };

  const handleDownloadBalanceSheet = () => {
    const balanceSheetData = {
      assets: [
        { name: 'Main Account', balance: mainAccountBalance },
        { name: 'Savings Account', balance: savingsBalance },
      ],
      liabilities: [
        { name: 'Credit Card', balance: creditCardBalance },
        { name: 'Business Loan', balance: businessLoanBalance },
        { name: 'Home Loan', balance: homeLoanBalance },
      ],
    };
    downloadBalanceSheet(profile, balanceSheetData);
  };

  const handleDownloadConfirmation = () => {
    downloadAccountConfirmation(profile, mainAccount);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return {
    handleSendMoney,
    handleLocalTransfer,
    handleDownloadStatement,
    handleDownload12MonthStatement,
    handleDownloadCashflowForecast,
    handleDownloadBalanceSheet,
    handleDownloadConfirmation,
    handleLogout,
  };
};
