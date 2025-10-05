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
import { ArrowLeft, Vault, TrendingUp, ArrowRightLeft, DollarSign, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LiquidityTransferDialog from './LiquidityTransferDialog';

interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
}

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

interface CountryTreasuryDashboardProps {
  country: Country;
  onBack: () => void;
}

const CountryTreasuryDashboard: React.FC<CountryTreasuryDashboardProps> = ({ country, onBack }) => {
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
  }, [country.code]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch treasury holdings filtered by country currency
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('treasury_holdings')
        .select('*')
        .eq('currency_code', country.currency)
        .order('last_updated', { ascending: false });

      if (holdingsError) throw holdingsError;

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('treasury_transactions')
        .select('*')
        .or(`from_currency.eq.${country.currency},to_currency.eq.${country.currency}`)
        .order('executed_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      setHoldings(holdingsData || []);
      setTransactions((transactionsData || []).map(t => ({
        ...t,
        transaction_type: t.transaction_type as 'conversion' | 'injection' | 'withdrawal' | 'adjustment'
      })));
    } catch (error) {
      console.error('Error fetching treasury data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch treasury data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return holdings.reduce((total, holding) => {
      // Convert to USD equivalent (simplified)
      const usdRate = getUSDRate(holding.currency_code);
      return total + (holding.amount * usdRate);
    }, 0);
  };

  const getUSDRate = (currency: string) => {
    // Simplified exchange rates - in production, fetch from live API
    const rates: Record<string, number> = {
      'USD': 1,
      'EUR': 1.10,
      'GBP': 1.25,
      'JPY': 0.0067,
      'ZAR': 0.053,
      'CAD': 0.74,
      'AUD': 0.65,
      'CHF': 1.10,
      'CNY': 0.14,
      'INR': 0.012
    };
    return rates[currency] || 1;
  };

  const calculateRiskWeightedAssets = () => {
    return holdings.reduce((total, holding) => {
      return total + (holding.amount * holding.risk_weight);
    }, 0);
  };

  const calculateCapitalAdequacyRatio = () => {
    const riskWeightedAssets = calculateRiskWeightedAssets();
    const totalCapital = calculateTotalValue();
    return riskWeightedAssets > 0 ? (totalCapital / riskWeightedAssets) * 100 : 0;
  };

  const handleTransaction = async () => {
    try {
      const { error } = await supabase
        .from('treasury_transactions')
        .insert({
          from_currency: transactionForm.from_currency,
          to_currency: transactionForm.to_currency,
          amount: parseFloat(transactionForm.amount),
          exchange_rate: 1.0, // Simplified
          transaction_type: transactionForm.transaction_type,
          reason: transactionForm.reason,
          executed_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Transaction executed successfully'
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
      console.error('Error executing transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute transaction',
        variant: 'destructive'
      });
    }
  };

  const adjustLiquidity = async (holdingId: string, newRatio: number) => {
    try {
      const { error } = await supabase
        .from('treasury_holdings')
        .update({ 
          liquidity_ratio: newRatio,
          last_updated: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', holdingId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Liquidity ratio updated'
      });

      fetchData();
    } catch (error) {
      console.error('Error updating liquidity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update liquidity ratio',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading treasury data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{country.flag}</span>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">{country.name} Treasury</h1>
                <p className="text-slate-600">Treasury Management Dashboard - {country.currency}</p>
              </div>
            </div>
          </div>
          <LiquidityTransferDialog sourceCurrency={country.currency} sourceType="treasury" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${calculateTotalValue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">USD Equivalent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capital Adequacy</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateCapitalAdequacyRatio().toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Basel III Compliant</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings Count</CardTitle>
              <Vault className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{holdings.length}</div>
              <p className="text-xs text-muted-foreground">Active Positions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">Last 10 transactions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity Management</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            <Card>
              <CardHeader>
                <CardTitle>Treasury Holdings - {country.name}</CardTitle>
                <CardDescription>Current positions and reserves for {country.currency}</CardDescription>
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
                            <div className="font-medium">{holding.currency_code}</div>
                            <div className="text-sm text-muted-foreground">{holding.currency_name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{holding.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{(holding.reserve_ratio * 100).toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{(holding.liquidity_ratio * 100).toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell>{holding.risk_weight.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(holding.last_updated).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liquidity">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Management</CardTitle>
                <CardDescription>Adjust liquidity ratios for optimal cash flow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {holdings.map((holding) => (
                  <div key={holding.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{holding.currency_code}</h4>
                        <p className="text-sm text-muted-foreground">{holding.currency_name}</p>
                      </div>
                      <Badge variant="outline">{(holding.liquidity_ratio * 100).toFixed(1)}%</Badge>
                    </div>
                    <Progress value={holding.liquidity_ratio * 100} className="mb-3" />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustLiquidity(holding.id, Math.max(0.1, holding.liquidity_ratio - 0.05))}
                      >
                        Decrease
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustLiquidity(holding.id, Math.min(1.0, holding.liquidity_ratio + 0.05))}
                      >
                        Increase
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Execute Transaction</CardTitle>
                  <CardDescription>Process treasury operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from_currency">From Currency</Label>
                      <Select
                        value={transactionForm.from_currency}
                        onValueChange={(value) => setTransactionForm(prev => ({...prev, from_currency: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {holdings.map(holding => (
                            <SelectItem key={holding.id} value={holding.currency_code}>
                              {holding.currency_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="to_currency">To Currency</Label>
                      <Select
                        value={transactionForm.to_currency}
                        onValueChange={(value) => setTransactionForm(prev => ({...prev, to_currency: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {holdings.map(holding => (
                            <SelectItem key={holding.id} value={holding.currency_code}>
                              {holding.currency_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm(prev => ({...prev, amount: e.target.value}))}
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transaction_type">Transaction Type</Label>
                    <Select
                      value={transactionForm.transaction_type}
                      onValueChange={(value: any) => setTransactionForm(prev => ({...prev, transaction_type: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversion">Currency Conversion</SelectItem>
                        <SelectItem value="injection">Liquidity Injection</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        <SelectItem value="adjustment">Balance Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={transactionForm.reason}
                      onChange={(e) => setTransactionForm(prev => ({...prev, reason: e.target.value}))}
                      placeholder="Transaction reason"
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
                  <CardDescription>Latest treasury operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{transaction.transaction_type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(transaction.executed_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <p><strong>Amount:</strong> {transaction.amount.toLocaleString()}</p>
                          <p><strong>From:</strong> {transaction.from_currency} <strong>To:</strong> {transaction.to_currency}</p>
                          {transaction.reason && <p><strong>Reason:</strong> {transaction.reason}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basel III Compliance</CardTitle>
                  <CardDescription>Capital adequacy and risk management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Capital Adequacy Ratio</span>
                    <Badge variant={calculateCapitalAdequacyRatio() >= 8 ? "default" : "destructive"}>
                      {calculateCapitalAdequacyRatio().toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={Math.min(100, calculateCapitalAdequacyRatio())} />
                  <p className="text-sm text-muted-foreground">
                    Minimum requirement: 8% (Basel III)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Liquidity Coverage</CardTitle>
                  <CardDescription>Short-term liquidity requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Liquidity Ratio</span>
                    <Badge variant="default">
                      {holdings.length > 0 
                        ? ((holdings.reduce((sum, h) => sum + h.liquidity_ratio, 0) / holdings.length) * 100).toFixed(1) + '%'
                        : '0%'
                      }
                    </Badge>
                  </div>
                  <Progress 
                    value={holdings.length > 0 
                      ? (holdings.reduce((sum, h) => sum + h.liquidity_ratio, 0) / holdings.length) * 100
                      : 0
                    } 
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended range: 20-40%
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CountryTreasuryDashboard;