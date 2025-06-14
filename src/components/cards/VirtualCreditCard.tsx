
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

type VirtualCreditCardProps = {
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  onClick: () => void;
  isSelected: boolean;
};

const VirtualCreditCard = ({ cardHolder, cardNumber, expiryDate, onClick, isSelected }: VirtualCreditCardProps) => {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "w-full max-w-sm rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-pointer",
        isSelected && "ring-4 ring-offset-2 ring-offset-background ring-yellow-300 scale-105"
      )}
    >
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
