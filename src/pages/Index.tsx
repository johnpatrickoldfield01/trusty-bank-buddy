
import { useOutletContext } from 'react-router-dom';
import { Profile } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AccountSummary from '@/components/dashboard/AccountSummary';
import QuickActions from '@/components/dashboard/QuickActions';
import TransactionList from '@/components/dashboard/TransactionList';
import PartnershipInitiator from '@/components/admin/PartnershipInitiator';

const Index = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile.full_name}!</h1>
        <p className="text-muted-foreground">Here's your financial overview for today.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <AccountSummary />
          <TransactionList />
        </div>

        <div className="space-y-8">
          <QuickActions />
          <PartnershipInitiator />
        </div>
      </div>
    </div>
  );
};

export default Index;
