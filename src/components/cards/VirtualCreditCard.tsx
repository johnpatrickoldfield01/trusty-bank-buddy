
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, CreditCard, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type VirtualCreditCardProps = {
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  onClick?: () => void;
  isSelected?: boolean;
  gradient: string;
};

const VirtualCreditCard = ({ cardHolder, cardNumber, expiryDate, cvv, onClick, isSelected, gradient }: VirtualCreditCardProps) => {
  const [showCvv, setShowCvv] = useState(false);

  const handleCvvToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCvv(!showCvv);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card 
      onClick={handleCardClick}
      className={cn(
        "w-full max-w-sm rounded-xl bg-gradient-to-br text-white shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-pointer",
        gradient,
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
          <div className="flex items-center space-x-2">
            <div>
              <p className="text-xs uppercase">CVV</p>
              <p className="font-medium tracking-wider">
                {showCvv ? cvv : '***'}
              </p>
            </div>
            <button
              onClick={handleCvvToggle}
              className="text-yellow-300 hover:text-yellow-100 transition-colors"
              title={showCvv ? 'Hide CVV' : 'Show CVV'}
            >
              {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualCreditCard;
