
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import VirtualCreditCard from '@/components/cards/VirtualCreditCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Profile } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const cardsData = [
  {
    cardNumber: '4242 4242 4242 4242',
    expiryDate: '12/30',
    expiryDateFull: '12/2030',
    cvv: '123',
    gradient: { from: 'from-blue-500', to: 'to-purple-600' },
  },
  {
    cardNumber: '4012 8888 8888 1881',
    expiryDate: '06/28',
    expiryDateFull: '06/2028',
    cvv: '456',
    gradient: { from: 'from-pink-500', to: 'to-rose-500' },
  },
  {
    cardNumber: '5102 1098 7654 3210',
    expiryDate: '08/29',
    expiryDateFull: '08/2029',
    cvv: '789',
    gradient: { from: 'from-green-400', to: 'to-emerald-500' },
  },
  {
    cardNumber: '4532 7890 1234 5678',
    expiryDate: '04/27',
    expiryDateFull: '04/2027',
    cvv: '101',
    gradient: { from: 'from-orange-400', to: 'to-red-500' },
  },
  {
    cardNumber: '4929 1234 5678 9012',
    expiryDate: '11/31',
    expiryDateFull: '11/2031',
    cvv: '212',
    gradient: { from: 'from-indigo-500', to: 'to-cyan-400' },
  },
  {
    cardNumber: '5541 2345 6789 0123',
    expiryDate: '03/26',
    expiryDateFull: '03/2026',
    cvv: '323',
    gradient: { from: 'from-yellow-400', to: 'to-amber-500' },
  },
  {
    cardNumber: '4111 2222 3333 4444',
    expiryDate: '07/30',
    expiryDateFull: '07/2030',
    cvv: '434',
    gradient: { from: 'from-teal-400', to: 'to-cyan-500' },
  },
  {
    cardNumber: '4682 9101 1121 3141',
    expiryDate: '01/29',
    expiryDateFull: '01/2029',
    cvv: '545',
    gradient: { from: 'from-lime-400', to: 'to-green-600' },
  },
  {
    cardNumber: '4444 5555 6666 7777',
    expiryDate: '09/27',
    expiryDateFull: '09/2027',
    cvv: '656',
    gradient: { from: 'from-fuchsia-500', to: 'to-purple-600' },
  },
  {
    cardNumber: '4890 1234 5678 9012',
    expiryDate: '02/28',
    expiryDateFull: '02/2028',
    cvv: '767',
    gradient: { from: 'from-sky-400', to: 'to-blue-600' },
  },
  {
    cardNumber: '4321 0987 6543 2109',
    expiryDate: '05/31',
    expiryDateFull: '05/2031',
    cvv: '878',
    gradient: { from: 'from-red-500', to: 'to-stone-700' },
  },
  {
    cardNumber: '4777 8888 9999 0000',
    expiryDate: '10/26',
    expiryDateFull: '10/2026',
    cvv: '989',
    gradient: { from: 'from-slate-800', to: 'to-slate-900' },
  },
];

const CardsPage = () => {
  const { profile } = useOutletContext<{ profile: Profile }>();
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const selectedCard = cardsData[selectedCardIndex];

  const handleTestPayment = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');

      if (error) {
        throw error;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Could not retrieve checkout URL.");
      }

    } catch (error: any) {
      console.error('Payment Error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Your Cards</h1>
      <p className="text-muted-foreground mb-8">View and manage your virtual cards. Select a card to view its details.</p>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-auto flex flex-col gap-8">
          {cardsData.map((card, index) => (
            <VirtualCreditCard
              key={index}
              cardHolder={profile.full_name || 'Valued Customer'}
              cardNumber={card.cardNumber}
              expiryDate={card.expiryDate}
              onClick={() => setSelectedCardIndex(index)}
              isSelected={selectedCardIndex === index}
              gradient={card.gradient}
            />
          ))}
        </div>
        <Card className="w-full max-w-sm sticky top-8">
            <CardHeader>
                <CardTitle>Virtual Card Details</CardTitle>
                <CardDescription>Keep these details secure.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Card Number</p>
                        <p className="font-mono text-lg font-semibold">{selectedCard.cardNumber}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className="text-lg font-semibold">{selectedCard.expiryDateFull}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">CVV</p>
                        <p className="text-lg font-semibold">{selectedCard.cvv}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Button onClick={handleTestPayment} disabled={isProcessing} className="w-full">
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Make a $10 Test Payment"
                    )}
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CardsPage;
