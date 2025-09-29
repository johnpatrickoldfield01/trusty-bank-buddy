import React from 'react';
import { Button } from '@/components/ui/button';

interface WalletAddressManagerProps {
  currentExchange?: string;
  currentCrypto?: string;
}

const WalletAddressManager = ({ currentExchange, currentCrypto }: WalletAddressManagerProps) => {
  return (
    <Button variant="outline" size="sm" className="gap-2">
      Manage Addresses (0)
    </Button>
  );
};

export default WalletAddressManager;