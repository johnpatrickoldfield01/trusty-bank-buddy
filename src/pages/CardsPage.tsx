
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import VirtualCreditCard from '@/components/cards/VirtualCreditCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Profile } from '@/components/layout/AppLayout';

const CardsPage = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();
  const cvv = '123';
  const cardNumber = '4242 4242 4242 4242';
  const expiryDate = '12/2030';

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Your Cards</h1>
      <p className="text-muted-foreground mb-8">View and manage your virtual cards.</p>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <VirtualCreditCard cardHolder={profile.full_name || 'Valued Customer'} />
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Virtual Card Details</CardTitle>
                <CardDescription>Keep these details secure.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Card Number</p>
                        <p className="font-mono text-lg font-semibold">{cardNumber}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className="text-lg font-semibold">{expiryDate}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">CVV</p>
                        <p className="text-lg font-semibold">{cvv}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CardsPage;
