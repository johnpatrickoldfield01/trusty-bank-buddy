
import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import VirtualCreditCard from '@/components/cards/VirtualCreditCard';
import { Profile } from '@/components/layout/AppLayout';
import { cardsData } from '@/data/cards';

const CardsPage = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Your Cards</h1>
      <p className="text-muted-foreground mb-8">Select a card to view its details, transactions, and manage settings.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cardsData.map((card, index) => (
          <Link key={index} to={`/cards/${index}`} className="flex justify-center">
            <VirtualCreditCard
              cardHolder={profile.full_name || 'Valued Customer'}
              cardNumber={card.cardNumber}
              expiryDate={card.expiryDate}
              gradient={card.gradient}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CardsPage;
