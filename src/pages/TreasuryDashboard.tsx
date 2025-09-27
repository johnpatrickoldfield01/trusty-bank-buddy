import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Vault, TrendingUp, ArrowRightLeft, DollarSign, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TreasuryHolding {
  id: string;
  currency_code: string;
  currency_name: string;
  amount: number;
  reserve_ratio: number;
  liquidity_ratio: number;
  risk_weight: number;
  last_updated: string;
}

interface TreasuryTransaction {
  id: string;
  from_currency: string;
  to_currency: string;
  amount: number;
  exchange_rate: number;
  transaction_type: 'conversion' | 'injection' | 'withdrawal' | 'adjustment';
  reason: string;
  executed_at: string;
}

const TreasuryDashboard = () => {
  const [holdings, setHoldings] = useState<TreasuryHolding[]>([]);
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [transactionForm, setTransactionForm] = useState({
    from_currency: '',
    to_currency: '',
    amount: '',
    transaction_type: 'conversion' as 'conversion' | 'injection' | 'withdrawal' | 'adjustment',
    reason: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [holdingsRes, transactionsRes] = await Promise.all([
        supabase.from('treasury_holdings').select('*').order('amount', { ascending: false }),
        supabase.from('treasury_transactions').select('*').order('executed_at', { ascending: false }).limit(50)
      ]);

      if (holdingsRes.data) setHoldings(holdingsRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data as TreasuryTransaction[]);
    } catch (error) {
      console.error('Error fetching treasury data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return holdings.reduce((total, holding) => {
      // Convert all to USD equivalent (simplified)
      const usdValue = holding.currency_code === 'USD' ? holding.amount : holding.amount * 0.85;
      return total + usdValue;
    }, 0);
  };

  const calculateRiskWeightedAssets = () => {
    return holdings.reduce((total, holding) => {
      const usdValue = holding.currency_code === 'USD' ? holding.amount : holding.amount * 0.85;
      return total + (usdValue * holding.risk_weight);
    }, 0);
  };

  const calculateCapitalAdequacyRatio = () => {
    const totalAssets = calculateTotalValue();
    const riskWeightedAssets = calculateRiskWeightedAssets();
    return riskWeightedAssets > 0 ? (totalAssets * 0.12) / riskWeightedAssets * 100 : 0;
  };

  const handleTransaction = async () => {
    try {
      const exchangeRate = 1.0; // Simplified for demo
      
      const { error } = await supabase.from('treasury_transactions').insert([
        {
          from_currency: transactionForm.from_currency,
          to_currency: transactionForm.to_currency,
          amount: parseFloat(transactionForm.amount),
          exchange_rate: exchangeRate,
          transaction_type: transactionForm.transaction_type,
          reason: transactionForm.reason,
          executed_by: (await supabase.auth.getUser()).data.user?.id
        }
      ]);

      if (error) throw error;

      toast({
        title: "Transaction Executed",
        description: `${transactionForm.transaction_type} transaction recorded successfully`,
      });

      setTransactionForm({
        from_currency: '',
        to_currency: '',
        amount: '',
        transaction_type: 'conversion',
        reason: ''
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute transaction",
        variant: "destructive"
      });
    }
  };

  const adjustLiquidity = async (currencyCode: string, newRatio: number) => {
    try {
      const { error } = await supabase
        .from('treasury_holdings')
        .update({ 
          liquidity_ratio: newRatio,
          last_updated: new Date().toISOString()
        })
        .eq('currency_code', currencyCode);

      if (error) throw error;

      toast({
        title: "Liquidity Adjusted",
        description: `${currencyCode} liquidity ratio updated to ${(newRatio * 100).toFixed(1)}%`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust liquidity ratio",
        variant: "destructive"
      });
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'injection': return 'bg-green-100 text-green-800';
      case 'withdrawal': return 'bg-red-100 text-red-800';
      case 'conversion': return 'bg-blue-100 text-blue-800';
      case 'adjustment': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading Treasury Dashboard...</div>;
  }

  const totalValue = calculateTotalValue();
  const capitalAdequacyRatio = calculateCapitalAdequacyRatio();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Vault className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Treasury Dashboard</h1>
          <p className="text-muted-foreground">Manage liquidity, capital ratios, and currency reserves</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-sm text-muted-foreground">Total Holdings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{capitalAdequacyRatio.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Capital Adequacy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{holdings.length}</p>
                <p className="text-sm text-muted-foreground">Currency Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{transactions.length}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="holdings">Currency Holdings</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity Management</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency Holdings</CardTitle>
              <CardDescription>100 Billion in mixed currency reserves</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reserve Ratio</TableHead>
                    <TableHead>Liquidity Ratio</TableHead>
                    <TableHead>Risk Weight</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((holding) => (
                    <TableRow key={holding.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{holding.currency_code}</p>
                          <p className="text-sm text-muted-foreground">{holding.currency_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-mono">{holding.amount.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={holding.reserve_ratio * 100} className="w-20" />
                          <span className="text-sm">{(holding.reserve_ratio * 100).toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={holding.liquidity_ratio * 100} className="w-20" />
                          <span className="text-sm">{(holding.liquidity_ratio * 100).toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{holding.risk_weight.toFixed(1)}</TableCell>
                      <TableCell>{new Date(holding.last_updated).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liquidity Adjustment Protocols</CardTitle>
              <CardDescription>Manage capital liquidity ratios by currency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency_select">Select Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {holdings.map((holding) => (
                        <SelectItem key={holding.currency_code} value={holding.currency_code}>
                          {holding.currency_code} - {holding.currency_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 items-end">
                  <Button 
                    onClick={() => selectedCurrency && adjustLiquidity(selectedCurrency, 0.20)}
                    disabled={!selectedCurrency}
                    variant="outline"
                    size="sm"
                  >
                    Set to 20%
                  </Button>
                  <Button 
                    onClick={() => selectedCurrency && adjustLiquidity(selectedCurrency, 0.30)}
                    disabled={!selectedCurrency}
                    variant="outline"
                    size="sm"
                  >
                    Set to 30%
                  </Button>
                  <Button 
                    onClick={() => selectedCurrency && adjustLiquidity(selectedCurrency, 0.40)}
                    disabled={!selectedCurrency}
                    variant="outline"
                    size="sm"
                  >
                    Set to 40%
                  </Button>
                </div>
              </div>

              {selectedCurrency && (
                <Card className="p-4 bg-blue-50">
                  {(() => {
                    const currency = holdings.find(h => h.currency_code === selectedCurrency);
                    return currency ? (
                      <div>
                        <h4 className="font-semibold">{currency.currency_name} ({currency.currency_code})</h4>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Current Liquidity</p>
                            <p className="text-lg font-mono">{(currency.liquidity_ratio * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Reserve Ratio</p>
                            <p className="text-lg font-mono">{(currency.reserve_ratio * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Risk Weight</p>
                            <p className="text-lg font-mono">{currency.risk_weight.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execute Transaction</CardTitle>
              <CardDescription>Manage currency conversions and adjustments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_currency">From Currency</Label>
                  <Select value={transactionForm.from_currency} onValueChange={(value) => setTransactionForm({...transactionForm, from_currency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {holdings.map((holding) => (
                        <SelectItem key={holding.currency_code} value={holding.currency_code}>
                          {holding.currency_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="to_currency">To Currency</Label>
                  <Select value={transactionForm.to_currency} onValueChange={(value) => setTransactionForm({...transactionForm, to_currency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {holdings.map((holding) => (
                        <SelectItem key={holding.currency_code} value={holding.currency_code}>
                          {holding.currency_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="transaction_type">Transaction Type</Label>
                  <Select value={transactionForm.transaction_type} onValueChange={(value: any) => setTransactionForm({...transactionForm, transaction_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion">Currency Conversion</SelectItem>
                      <SelectItem value="injection">Liquidity Injection</SelectItem>
                      <SelectItem value="withdrawal">Strategic Withdrawal</SelectItem>
                      <SelectItem value="adjustment">Capital Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Transaction Reason</Label>
                <Input 
                  value={transactionForm.reason}
                  onChange={(e) => setTransactionForm({...transactionForm, reason: e.target.value})}
                  placeholder="Reason for transaction..."
                />
              </div>
              <Button onClick={handleTransaction} className="w-full">
                Execute Transaction
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.from_currency}</TableCell>
                      <TableCell>{transaction.to_currency}</TableCell>
                      <TableCell>{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>{transaction.exchange_rate.toFixed(4)}</TableCell>
                      <TableCell>{new Date(transaction.executed_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold">Basel III Compliance</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Capital Adequacy Ratio</span>
                      <span className="text-sm font-mono">{capitalAdequacyRatio.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(capitalAdequacyRatio, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">Required: 8.0% minimum</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Liquidity Coverage</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Average LCR</span>
                      <span className="text-sm font-mono">
                        {((holdings.reduce((sum, h) => sum + h.liquidity_ratio, 0) / holdings.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(holdings.reduce((sum, h) => sum + h.liquidity_ratio, 0) / holdings.length) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">Required: 100% minimum</p>
                  </div>
                </Card>
              </div>

              <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Treasury Access Notice</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      This treasury system is accessed with credentials: oldfieldjohnpatrick@gmail.com 
                      with specialized treasury management privileges. All transactions are logged 
                      and subject to regulatory oversight and compliance monitoring.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TreasuryDashboard;