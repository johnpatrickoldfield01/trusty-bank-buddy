import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const mockTransactions = [
  { id: '1', date: '2024-01-15', type: 'Buy', amount: 0.5, price: 67234.56, usdValue: 33617.28, zarValue: 621919.68, status: 'Completed', txHash: '0x1a2b3c...', exchange: 'Coinbase' },
  { id: '2', date: '2024-01-14', type: 'Sell', amount: 0.25, price: 67000.00, usdValue: 16750.00, zarValue: 309875.00, status: 'Completed', txHash: '0x4d5e6f...', exchange: 'Binance' },
  { id: '3', date: '2024-01-12', type: 'Send', amount: 0.1, price: 66800.00, usdValue: 6680.00, zarValue: 123580.00, status: 'Completed', txHash: '0x7g8h9i...', exchange: 'Internal', recipient: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
  { id: '4', date: '2024-01-10', type: 'Receive', amount: 0.3, price: 66500.00, usdValue: 19950.00, zarValue: 369075.00, status: 'Completed', txHash: '0xjklmno...', exchange: 'Internal', sender: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' },
  { id: '5', date: '2024-01-08', type: 'Buy', amount: 0.75, price: 66200.00, usdValue: 49650.00, zarValue: 918525.00, status: 'Completed', txHash: '0xpqrstu...', exchange: 'Luno' },
];

const mockPriceHistory = [
  { date: '2024-01-01', price: 65000 },
  { date: '2024-01-02', price: 65500 },
  { date: '2024-01-03', price: 66000 },
  { date: '2024-01-04', price: 65800 },
  { date: '2024-01-05', price: 66200 },
  { date: '2024-01-06', price: 66100 },
  { date: '2024-01-07', price: 66400 },
  { date: '2024-01-08', price: 66200 },
  { date: '2024-01-09', price: 66600 },
  { date: '2024-01-10', price: 66500 },
  { date: '2024-01-11', price: 66800 },
  { date: '2024-01-12', price: 66800 },
  { date: '2024-01-13', price: 67000 },
  { date: '2024-01-14', price: 67000 },
  { date: '2024-01-15', price: 67234.56 },
];

const cryptoData: { [key: string]: { name: string; symbol: string; currentPrice: number; change24h: number } } = {
  BTC: { name: 'Bitcoin', symbol: 'BTC', currentPrice: 67234.56, change24h: 2.34 },
  ETH: { name: 'Ethereum', symbol: 'ETH', currentPrice: 3456.78, change24h: -1.23 },
  ADA: { name: 'Cardano', symbol: 'ADA', currentPrice: 0.4567, change24h: -0.78 },
  SOL: { name: 'Solana', symbol: 'SOL', currentPrice: 156.78, change24h: -2.67 },
  DOGE: { name: 'Dogecoin', symbol: 'DOGE', currentPrice: 0.1567, change24h: 4.56 },
};

const CryptoTransactionsPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [transactions] = useState(mockTransactions);
  const { toast } = useToast();

  if (!symbol || !cryptoData[symbol]) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="text-center py-10">
            <h2 className="text-2xl font-bold">Cryptocurrency Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested cryptocurrency could not be found.</p>
            <Button onClick={() => navigate('/crypto')} className="mt-4">
              Back to Crypto Portfolio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cryptoInfo = cryptoData[symbol];
  const isPositive = cryptoInfo.change24h > 0;

  const downloadTaxCertificate = () => {
    toast({
      title: "Tax Certificate Generated",
      description: `${cryptoInfo.name} tax certificate with compliance details has been downloaded.`,
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Buy':
        return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
      case 'Sell':
        return <div className="w-3 h-3 rounded-full bg-red-500"></div>;
      case 'Send':
        return <div className="w-3 h-3 rounded-full bg-blue-500"></div>;
      case 'Receive':
        return <div className="w-3 h-3 rounded-full bg-purple-500"></div>;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(`/crypto/${symbol}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cryptoInfo.name} Transactions</h1>
            <p className="text-muted-foreground">Complete transaction history for {symbol}</p>
          </div>
        </div>
        <Button onClick={downloadTaxCertificate} className="bg-bank-primary hover:bg-bank-primary/90">
          <Download className="h-4 w-4 mr-2" />
          Download Tax Certificate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                ${cryptoInfo.currentPrice.toLocaleString()}
              </div>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{cryptoInfo.change24h.toFixed(2)}% (24h)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                ≈ R {(cryptoInfo.currentPrice * 18.50).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {transactions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                This month
              </div>
              <div className="text-xs text-muted-foreground">
                Volume: {transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(4)} {symbol}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                R {transactions.reduce((sum, t) => sum + t.zarValue, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Transaction volume (ZAR)
              </div>
              <div className="text-xs text-muted-foreground">
                ≈ ${transactions.reduce((sum, t) => sum + t.usdValue, 0).toLocaleString()} USD
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price History (15 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockPriceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#f7931a" 
                strokeWidth={2}
                dot={{ fill: '#f7931a', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {transaction.type} {transaction.amount} {symbol}
                      </span>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.date} • {transaction.exchange} • ${transaction.price.toLocaleString()}/coin
                    </div>
                    {transaction.type === 'Send' && transaction.recipient && (
                      <div className="text-xs text-muted-foreground">
                        To: {transaction.recipient.substring(0, 20)}...
                      </div>
                    )}
                    {transaction.type === 'Receive' && transaction.sender && (
                      <div className="text-xs text-muted-foreground">
                        From: {transaction.sender.substring(0, 20)}...
                      </div>
                    )}
                    <div className="text-xs text-blue-600">
                      Tx: {transaction.txHash}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${transaction.usdValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    R {transaction.zarValue.toLocaleString()}
                  </div>
                  <div className={`text-sm ${
                    transaction.type === 'Buy' ? 'text-red-600' : 
                    transaction.type === 'Sell' ? 'text-green-600' : 
                    'text-blue-600'
                  }`}>
                    {transaction.type === 'Buy' && '-'}
                    {transaction.type === 'Sell' && '+'}
                    {transaction.amount} {symbol}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Capital Gains Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Purchases:</span>
                  <span className="font-medium">R 1,540,444.68</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Sales:</span>
                  <span className="font-medium">R 309,875.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Realized Gains/Losses:</span>
                  <span className="font-medium text-red-600">-R 15,234.50</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Liability (CGT):</span>
                  <span className="font-medium">R 0.00</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Compliance Notes</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• All transactions comply with SARS crypto guidelines</p>
                <p>• CGT exemption threshold not exceeded</p>
                <p>• Records maintained for 5-year audit period</p>
                <p>• VAT not applicable for personal crypto trading</p>
                <p>• Anti-money laundering checks completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoTransactionsPage;