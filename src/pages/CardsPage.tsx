
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
  },
  {
    cardNumber: '4012 8888 8888 1881',
    expiryDate: '06/28',
    expiryDateFull: '06/2028',
    cvv: '456',
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
