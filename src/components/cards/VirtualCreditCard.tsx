
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, CreditCard } from 'lucide-react';

type VirtualCreditCardProps = {
  cardHolder: string;
};

const VirtualCreditCard = ({ cardHolder }: VirtualCreditCardProps) => {
  const cardNumber = '4242 4242 4242 4242';
  const expiryDate = '12/30';

  return (
    <Card className="w-full max-w-sm rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <span className="font-bold text-xl">TrustyBank</span>
          <Wifi className="h-6 w-6" />
        </div>
        <div className="mt-6">
          <CreditCard className="h-10 w-10 text-yellow-300 opacity-50" />
        </div>
        <div className="mt-4">
          <p className="text-2xl font-mono tracking-widest">{cardNumber}</p>
        </div>
        <div className="mt-6 flex justify-between items-end">
          <div>
            <p className="text-xs uppercase">Card Holder</p>
            <p className="font-medium tracking-wider">{cardHolder}</p>
          </div>
          <div>
            <p className="text-xs uppercase">Expires</p>
            <p className="font-medium tracking-wider">{expiryDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualCreditCard;
