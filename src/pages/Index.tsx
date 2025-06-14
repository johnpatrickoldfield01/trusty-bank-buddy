
import { useOutletContext } from 'react-router-dom';
import { Profile } from '@/components/layout/AppLayout';
import AccountSummary from '@/components/dashboard/AccountSummary';
import QuickActions from '@/components/dashboard/QuickActions';
import TransactionList, { Transaction } from '@/components/dashboard/TransactionList';
import PartnershipInitiator from '@/components/admin/PartnershipInitiator';
import { toast } from 'sonner';

const Index = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();

  // Mock data for dashboard components
  const accountSummaryData = {
    mainAccountBalance: 52430.50,
    savingsBalance: 12500.00,
    creditCardBalance: -435.20,
    creditCardLimit: 15000,
  };

  const transactionsData: Transaction[] = [
    { id: '1', name: 'Netflix Subscription', amount: -15.99, date: 'June 13, 2025', category: 'Entertainment', icon: '🎬' },
    { id: '2', name: 'Salary Deposit', amount: 4500.00, date: 'June 12, 2025', category: 'Income', icon: '💰' },
    { id: '3', name: 'Woolworths Groceries', amount: -85.40, date: 'June 12, 2025', category: 'Groceries', icon: '🛒' },
    { id: '4', name: 'Uber Eats', amount: -25.50, date: 'June 11, 2025', category: 'Food', icon: '🍔' },
    { id: '5', name: 'Client Payment', amount: 1200.00, date: 'June 10, 2025', category: 'Income', icon: '💼' },
  ];

  const handleSendMoney = (data: { amount: number; recipientName: string }) => {
    // In a real app, this would trigger an API call.
    // The SendMoneyDialog component already shows a success toast.
    console.log('Send money action:', data);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile.full_name}!</h1>
        <p className="text-muted-foreground">Here's your financial overview for today.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <AccountSummary {...accountSummaryData} />
          <TransactionList transactions={transactionsData} />
        </div>

        <div className="space-y-8">
          <QuickActions onSendMoney={handleSendMoney} />
          <PartnershipInitiator />
        </div>
      </div>
    </div>
  );
};

export default Index;
