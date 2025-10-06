import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export const StandardBankRegistration = () => {
  const steps = [
    {
      title: 'Visit the Developer Portal',
      description: 'Go to Standard Bank API Developer Portal',
      action: (
        <Button
          onClick={() => window.open('https://developer.standardbank.co.za/', '_blank')}
          className="mt-2"
        >
          Open Portal <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    {
      title: 'Create an Account',
      description: 'Sign up for a developer account on their portal',
    },
    {
      title: 'Explore APIs',
      description: 'Browse available APIs and select the ones you need for your application',
      action: (
        <Button
          variant="outline"
          onClick={() => window.open('https://developer.standardbank.co.za/product', '_blank')}
          className="mt-2"
        >
          View APIs <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    {
      title: 'Request Access',
      description: 'Apply for API access through their portal. You may need to provide business details and use cases.',
    },
    {
      title: 'Get Credentials',
      description: 'Once approved, you will receive API credentials (Client ID, Client Secret, Access Tokens)',
    },
    {
      title: 'Test Integration',
      description: 'Use the API Testing tab to test your credentials once you receive them',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Standard Bank API Registration Process</CardTitle>
          <CardDescription>
            Standard Bank requires manual registration through their developer portal. Follow these steps:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {step.action}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Standard Bank Account Details</CardTitle>
          <CardDescription>
            Use these details when registering on the developer portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Account Holder</p>
              <p className="font-medium">MR. JOHN OLDFIELD</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account Number</p>
              <p className="font-medium">10 25 323 085 1</p>
            </div>
            <div>
              <p className="text-muted-foreground">Branch</p>
              <p className="font-medium">PAVILION (005426)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account Type</p>
              <p className="font-medium">CURRENT</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
