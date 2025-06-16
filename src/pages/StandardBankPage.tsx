
import React, { useState } from 'react';
import { StandardBankRegistration } from '@/components/banking/StandardBankRegistration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStandardBankApi } from '@/hooks/useStandardBankApi';
import { Loader2 } from 'lucide-react';

const StandardBankPage = () => {
  const [accessToken, setAccessToken] = useState('');
  const [accountData, setAccountData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const { getAccountInfo, getTransactions, isLoading } = useStandardBankApi();

  const handleGetAccounts = async () => {
    if (!accessToken) {
      alert('Please enter an access token');
      return;
    }
    
    const result = await getAccountInfo(accessToken);
    if (result.success) {
      setAccountData(result.data);
    }
  };

  const handleGetTransactions = async () => {
    if (!accessToken) {
      alert('Please enter an access token');
      return;
    }
    
    // You would need to get the account ID from the account data
    const accountId = 'your-account-id'; // This should come from account data
    const result = await getTransactions(accessToken, accountId);
    if (result.success) {
      setTransactionData(result.data);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Standard Bank API Integration</h1>
        <p className="text-muted-foreground mt-2">
          Integrate with Standard Bank's developer API for banking services
        </p>
      </div>

      <Tabs defaultValue="registration" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="registration" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Developer Portal Registration</CardTitle>
                <CardDescription>
                  Register your application with Standard Bank's developer portal to get API access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StandardBankRegistration />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Testing</CardTitle>
                <CardDescription>
                  Test Standard Bank API endpoints after receiving your credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Enter your Standard Bank access token"
                  />
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleGetAccounts} disabled={isLoading || !accessToken}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Get Accounts
                  </Button>
                  <Button onClick={handleGetTransactions} disabled={isLoading || !accessToken}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Get Transactions
                  </Button>
                </div>

                {accountData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(accountData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {transactionData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(transactionData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integration" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>
                  Current status of Standard Bank API integration in your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Registration Status</h3>
                      <p className="text-sm text-muted-foreground">Developer portal registration</p>
                    </div>
                    <div className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Pending
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">API Credentials</h3>
                      <p className="text-sm text-muted-foreground">Access tokens and certificates</p>
                    </div>
                    <div className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                      Not Available
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Production Access</h3>
                      <p className="text-sm text-muted-foreground">Live API environment</p>
                    </div>
                    <div className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                      Not Available
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StandardBankPage;
