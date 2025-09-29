
import React from 'react';
import { Button } from '@/components/ui/button';
import { type Profile } from '@/components/layout/AppLayout';
import LocationSelector from '@/components/dashboard/LocationSelector';

interface DashboardHeaderProps {
  profile: Profile | null;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ profile, onLogout }) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || 'User'}!</h1>
        <Button onClick={onLogout} variant="outline">Logout</Button>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Select your location to view balances in local currency</p>
        <LocationSelector />
      </div>
    </div>
  );
};

export default DashboardHeader;
