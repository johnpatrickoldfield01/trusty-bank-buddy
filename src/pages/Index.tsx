
import { useOutletContext } from 'react-router-dom';
import { Profile } from '@/components/layout/AppLayout';
import AccountSummary from '@/components/dashboard/AccountSummary';
import QuickActions from '@/components/dashboard/QuickActions';
import TransactionList, { Transaction } from '@/components/dashboard/TransactionList';
import PartnershipInitiator from '@/components/admin/PartnershipInitiator';
import { toast } from "sonner";

const Index = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();

  // Mock data for AccountSummary
  const accountSummaryData = {
    mainAccountBalance: 12540.75,
    savingsBalance: 5830.20,
    creditCardBalance: -430.50,
    creditCardLimit: 10000,
  };

  // Mock data for TransactionList
  const mockTransactions: Transaction[] = [
    { id: '1', name: 'Netflix Subscription', amount: -15.99, date: 'June 12, 2025', category: 'Entertainment', icon: '🎬' },
    { id: '2', name: 'Salary Deposit', amount: 3500.00, date: 'June 10, 2025', category: 'Income', icon: '💼' },
    { id: '3', name: 'Grocery Shopping', amount: -120.45, date: 'June 10, 2025', category: 'Food', icon: '🛒' },
    { id: '4', name: 'Starbucks Coffee', amount: -5.75, date: 'June 9, 2025', category: 'Food', icon: '☕' },
  ];

  // Mock handler for QuickActions
  const handleSendMoney = (data: { amount: number; recipientName: string }) => {
    console.log('Sending money:', data);
    toast.success(`Successfully sent $${data.amount.toFixed(2)} to ${data.recipientName}`);
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
          <TransactionList transactions={mockTransactions} />
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
