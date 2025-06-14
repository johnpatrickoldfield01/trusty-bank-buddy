
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

const PaymentCancelledPage = () => {
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md text-center animate-fade-in">
        <CardHeader>
          <div className="mx-auto bg-red-100 rounded-full p-3 w-fit">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="mt-4">Payment Canceled</CardTitle>
          <CardDescription>Your test payment was canceled. You have not been charged.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            You can return to the cards page and try again if you wish.
          </p>
          <Button asChild>
            <Link to="/cards">Return to Cards Page</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelledPage;
