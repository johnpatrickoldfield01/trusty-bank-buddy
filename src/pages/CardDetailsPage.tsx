
import React from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { cardsData } from '@/data/cards';
import VirtualCreditCard from '@/components/cards/VirtualCreditCard';
import PaymentProcessor from '@/components/cards/PaymentProcessor';
import TransactionList from '@/components/dashboard/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/components/layout/AppLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const mockTransactions = [
  { id: '1', name: 'Netflix Subscription', amount: -150.00, date: '2025-06-12', category: 'Entertainment', icon: '🎬' },
  { id: '2', name: 'Spotify Premium', amount: -99.00, date: '2025-06-10', category: 'Music', icon: '🎵' },
  { id: '3', name: 'Amazon Purchase', amount: -540.50, date: '2025-06-08', category: 'Shopping', icon: '🛍️' },
  { id: '4', name: 'Uber Eats', amount: -230.25, date: '2025-06-05', category: 'Food', icon: '🍔' },
  { id: '5', name: 'Online Course', amount: -1200.00, date: '2025-06-02', category: 'Education', icon: '📚' },
];

const CardDetailsPage = () => {
    const { cardIndex } = useParams<{ cardIndex: string }>();
    const { profile } = useOutletContext<{ profile: Profile }>();
    const index = parseInt(cardIndex || '0', 10);
    const card = cardsData[index];

    if (!card) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Card not found</h1>
                <p className="text-muted-foreground">The card you are looking for does not exist.</p>
                <Button asChild variant="link" className="mt-4">
                    <Link to="/cards">Go back to cards</Link>
                </Button>
            </div>
        );
    }
    
    const { creditLimit } = card;
    const outstandingBalance = mockTransactions.reduce((acc, t) => acc - t.amount, 0);

    const handleDownloadStatement = () => {
      toast.info("3-month statement functionality for individual cards is not implemented yet.");
    };
    
    const handleDownload12MonthStatement = () => {
      toast.info("12-month statement functionality for individual cards is not implemented yet.");
    };

    return (
        <div className="container mx-auto py-8 animate-fade-in">
            <Button asChild variant="ghost" className="mb-4 -ml-4">
                <Link to="/cards"><ArrowLeft className="mr-2 h-4 w-4" />Back to Cards</Link>
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <VirtualCreditCard
                            cardHolder={profile.full_name || 'Valued Customer'}
                            cardNumber={card.cardNumber}
                            expiryDate={card.expiryDate}
                            cvv={card.cvv}
                            gradient={card.gradient}
                            isSelected={true}
                        />
                        
                        {/* Add Payment Processor */}
                        <PaymentProcessor
                            cardNumber={card.cardNumber}
                            cardHolder={profile.full_name || 'Valued Customer'}
                            expiryDate={card.expiryDate}
                            cvv={card.cvv}
                        />
                        
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>Card Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Credit Limit</p>
                                    <p className="text-2xl font-semibold">R{creditLimit.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                                    <p className="text-2xl font-semibold">R{outstandingBalance.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Available Credit</p>
                                    <p className="text-2xl font-semibold text-green-600">R{(creditLimit - outstandingBalance).toFixed(2)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <TransactionList 
                      transactions={mockTransactions} 
                      onDownloadStatement={handleDownloadStatement} 
                      onDownload12MonthStatement={handleDownload12MonthStatement}
                    />
                </div>
            </div>
        </div>
    );
};

export default CardDetailsPage;
