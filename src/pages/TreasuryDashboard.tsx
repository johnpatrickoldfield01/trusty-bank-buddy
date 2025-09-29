import React, { useState } from 'react';
import TreasuryPasswordProtection from '@/components/treasury/TreasuryPasswordProtection';
import RegionalTreasuryDashboard from '@/components/treasury/RegionalTreasuryDashboard';

const TreasuryDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('treasuryAuthenticated', 'true');
    sessionStorage.setItem('treasuryAuthTime', Date.now().toString());
  };

  if (!isAuthenticated) {
    return <TreasuryPasswordProtection onAuthenticated={handleAuthenticated} />;
  }

  return <RegionalTreasuryDashboard />;
};

export default TreasuryDashboard;