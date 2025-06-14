
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { type Profile } from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';

const Index = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();

  return <Dashboard profile={profile} />;
};

export default Index;
