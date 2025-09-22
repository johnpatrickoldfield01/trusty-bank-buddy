
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useMonthlySpending } from '@/hooks/useMonthlySpending';

export const useDashboardData = () => {
  const { accounts, isLoadingAccounts, refreshAccounts } = useAccounts();
  const { transactions, isLoadingTransactions } = useTransactions();
  const { spendingThisMonth, isLoadingSpending } = useMonthlySpending();
  
  const mainAccount = accounts?.find(acc => acc.account_type === 'main');
  const savingsAccount = accounts?.find(acc => acc.account_type === 'savings');
  const creditAccount = accounts?.find(acc => acc.account_type === 'credit');
  const businessLoanAccount = accounts?.find(acc => acc.account_name === 'Business Loan');
  const homeLoanAccount = accounts?.find(acc => acc.account_name === 'Home Loan');

  const mainAccountBalance = mainAccount?.balance ?? 0;
  const savingsBalance = savingsAccount?.balance ?? 0;
  const creditCardBalance = creditAccount?.balance ?? 0;
  const creditCardLimit = 10000; 
  const businessLoanBalance = businessLoanAccount?.balance ?? 0;
  const homeLoanBalance = homeLoanAccount?.balance ?? 0;

  const mainAccountNumber = mainAccount?.account_number;
  const savingsAccountNumber = savingsAccount?.account_number;
  const creditCardAccountNumber = creditAccount?.account_number;
  const businessLoanAccountNumber = businessLoanAccount?.account_number;
  const homeLoanAccountNumber = homeLoanAccount?.account_number;

  const totalBalance = mainAccountBalance + savingsBalance;

  return {
    accounts,
    transactions,
    spendingThisMonth,
    isLoadingAccounts,
    isLoadingTransactions,
    isLoadingSpending,
    mainAccount,
    mainAccountBalance,
    savingsBalance,
    creditCardBalance,
    creditCardLimit,
    businessLoanBalance,
    homeLoanBalance,
    mainAccountNumber,
    savingsAccountNumber,
    creditCardAccountNumber,
    businessLoanAccountNumber,
    homeLoanAccountNumber,
    totalBalance,
    refreshAccounts,
  };
};
