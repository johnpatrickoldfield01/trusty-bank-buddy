
import React from 'react';
import { Button } from '@/components/ui/button';
import { type Profile } from '@/components/layout/AppLayout';

interface DashboardHeaderProps {
  profile: Profile | null;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ profile, onLogout }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || 'User'}!</h1>
      <Button onClick={onLogout} variant="outline">Logout</Button>
    </div>
  );
};

export default DashboardHeader;
