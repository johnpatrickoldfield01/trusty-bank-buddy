
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PremiumCardOffer = () => {
  return (
    <div className="mt-8">
      <Card className="bg-gradient-to-r from-bank-primary to-bank-accent text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Premium Card Offer</h3>
              <p className="text-white/80 max-w-md">Upgrade to our Premium Card and enjoy 2% cashback on all purchases and zero foreign transaction fees.</p>
            </div>
            <button className="bg-white text-bank-primary px-6 py-2 rounded-md font-medium hover:bg-white/90 transition-colors">
              Learn More
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumCardOffer;
