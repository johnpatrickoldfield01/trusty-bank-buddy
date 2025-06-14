
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const PaymentSuccessPage = () => {
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md text-center animate-fade-in">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="mt-4">Payment Successful!</CardTitle>
          <CardDescription>Thank you for your test payment. Your transaction has been completed.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            This was a simulated transaction using Stripe's test mode. No real money was charged.
          </p>
          <Button asChild>
            <Link to="/cards">Return to Cards Page</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
