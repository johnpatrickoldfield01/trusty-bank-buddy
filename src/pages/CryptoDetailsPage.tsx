
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Download, Receipt, Loader2 } from 'lucide-react';
import SendCryptoDialog from '@/components/crypto/SendCryptoDialog';
import { useCryptoTransactions } from '@/hooks/useCryptoTransactions';
import { useCryptoPDFGenerator } from '@/hooks/useCryptoPDFGenerator';
import { useToast } from '@/hooks/use-toast';

const CryptoDetailsPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  const cryptocurrencies = [
    { rank: 1, name: 'Bitcoin', symbol: 'BTC', price: 43250.50, change: 2.34, marketCap: 850000000000, volume: 15000000000 },
    { rank: 2, name: 'Ethereum', symbol: 'ETH', price: 2680.75, change: -1.12, marketCap: 320000000000, volume: 8000000000 },
    { rank: 3, name: 'Tether', symbol: 'USDT', price: 1.00, change: 0.02, marketCap: 95000000000, volume: 25000000000 },
    { rank: 4, name: 'BNB', symbol: 'BNB', price: 315.20, change: 1.87, marketCap: 48000000000, volume: 800000000 },
    { rank: 5, name: 'Solana', symbol: 'SOL', price: 98.45, change: 4.21, marketCap: 42000000000, volume: 1200000000 },
    { rank: 6, name: 'USDC', symbol: 'USDC', price: 1.00, change: -0.01, marketCap: 32000000000, volume: 3500000000 },
    { rank: 7, name: 'XRP', symbol: 'XRP', price: 0.62, change: -2.15, marketCap: 34000000000, volume: 1100000000 },
    { rank: 8, name: 'Dogecoin', symbol: 'DOGE', price: 0.095, change: 3.45, marketCap: 13500000000, volume: 600000000 },
    { rank: 9, name: 'Cardano', symbol: 'ADA', price: 0.48, change: -0.89, marketCap: 17000000000, volume: 400000000 },
    { rank: 10, name: 'Avalanche', symbol: 'AVAX', price: 37.82, change: 2.67, marketCap: 14500000000, volume: 350000000 },
    { rank: 11, name: 'TRON', symbol: 'TRX', price: 0.105, change: 1.23, marketCap: 9200000000, volume: 280000000 },
    { rank: 12, name: 'Chainlink', symbol: 'LINK', price: 14.56, change: -1.78, marketCap: 8500000000, volume: 220000000 },
    { rank: 13, name: 'Polygon', symbol: 'MATIC', price: 0.89, change: 2.11, marketCap: 8200000000, volume: 180000000 },
    { rank: 14, name: 'Wrapped Bitcoin', symbol: 'WBTC', price: 43180.25, change: 2.31, marketCap: 6800000000, volume: 150000000 },
    { rank: 15, name: 'Polkadot', symbol: 'DOT', price: 6.78, change: -3.45, marketCap: 8900000000, volume: 190000000 },
    { rank: 16, name: 'Litecoin', symbol: 'LTC', price: 73.42, change: 0.56, marketCap: 5400000000, volume: 240000000 },
    { rank: 17, name: 'Internet Computer', symbol: 'ICP', price: 12.89, change: 4.67, marketCap: 5900000000, volume: 85000000 },
    { rank: 18, name: 'Shiba Inu', symbol: 'SHIB', price: 0.000024, change: 5.23, marketCap: 14200000000, volume: 320000000 },
    { rank: 19, name: 'Uniswap', symbol: 'UNI', price: 6.34, change: -2.87, marketCap: 4800000000, volume: 120000000 },
    { rank: 20, name: 'Ethereum Classic', symbol: 'ETC', price: 20.45, change: 1.92, marketCap: 3000000000, volume: 95000000 },
    { rank: 21, name: 'Dai', symbol: 'DAI', price: 1.00, change: 0.00, marketCap: 5300000000, volume: 250000000 },
    { rank: 22, name: 'Cosmos', symbol: 'ATOM', price: 9.87, change: -1.45, marketCap: 3800000000, volume: 110000000 },
    { rank: 23, name: 'Filecoin', symbol: 'FIL', price: 5.67, change: 3.21, marketCap: 3200000000, volume: 75000000 },
    { rank: 24, name: 'Stellar', symbol: 'XLM', price: 0.124, change: -0.78, marketCap: 3600000000, volume: 88000000 },
    { rank: 25, name: 'VeChain', symbol: 'VET', price: 0.032, change: 2.45, marketCap: 2300000000, volume: 65000000 },
    { rank: 26, name: 'THETA', symbol: 'THETA', price: 1.23, change: -2.11, marketCap: 1200000000, volume: 42000000 },
    { rank: 27, name: 'Monero', symbol: 'XMR', price: 158.90, change: 1.67, marketCap: 2900000000, volume: 78000000 },
    { rank: 28, name: 'Algorand', symbol: 'ALGO', price: 0.18, change: -3.22, marketCap: 1400000000, volume: 35000000 },
    { rank: 29, name: 'Hedera', symbol: 'HBAR', price: 0.065, change: 4.88, marketCap: 2200000000, volume: 58000000 },
    { rank: 30, name: 'Flow', symbol: 'FLOW', price: 0.78, change: -1.33, marketCap: 1100000000, volume: 28000000 }
  ];

  const crypto = cryptocurrencies.find(c => c.symbol === symbol?.toUpperCase());
  const [balance, setBalance] = useState(1000000);
  const { transactions, loading, error, refetch } = useCryptoTransactions(symbol);
  const { generateProofOfPayment, generateTaxationSummary } = useCryptoPDFGenerator();
  const { toast } = useToast();

  // Refresh transactions when the page loads or symbol changes
  useEffect(() => {
    refetch();
  }, [symbol, refetch]);

  if (!crypto) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cryptocurrency Not Found</h1>
          <Button onClick={() => navigate('/crypto')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Crypto Portfolio
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return price.toPrecision(6);
    } else if (price < 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(2);
    }
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    }
    return num.toLocaleString();
  };

  const portfolioValue = crypto.price * balance;

  const downloadTaxCertificate = () => {
    if (transactions.length === 0) {
      toast({
        title: "No Transactions Found",
        description: "No cryptocurrency transactions available for tax summary.",
        variant: "destructive"
      });
      return;
    }
    
    generateTaxationSummary(transactions, symbol || 'BTC', crypto.price);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/crypto')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portfolio
        </Button>
        <div className="flex gap-2">
          <Button onClick={downloadTaxCertificate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Tax Summary
          </Button>
          <SendCryptoDialog 
            crypto={crypto} 
            balance={balance} 
            onBalanceUpdate={setBalance}
          />
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle className="text-3xl">{crypto.name}</CardTitle>
                  <Badge variant="secondary" className="text-lg px-3 py-1 mt-2">
                    {crypto.symbol}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">${formatPrice(crypto.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  {crypto.change >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <Badge variant={crypto.change >= 0 ? "default" : "destructive"} className="text-sm">
                    {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}% (24h)
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-mono font-semibold">
                  {balance.toLocaleString()} {crypto.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Value:</span>
                <span className="font-mono font-bold text-bank-primary text-lg">
                  ${portfolioValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">24h P&L:</span>
                <span className={`font-mono font-semibold ${crypto.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {crypto.change >= 0 ? '+' : ''}${((portfolioValue * crypto.change) / 100).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Market Rank:</span>
                <span className="font-semibold">#{crypto.rank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Market Cap:</span>
                <span className="font-mono font-semibold">
                  ${formatLargeNumber(crypto.marketCap)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">24h Volume:</span>
                <span className="font-mono font-semibold">
                  ${formatLargeNumber(crypto.volume)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your {crypto.symbol} Holdings</p>
                <p className="text-2xl font-bold">{balance.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <p className="text-2xl font-bold">${formatPrice(crypto.price)}</p>
                <p className="text-sm text-muted-foreground">USD</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                <p className="text-2xl font-bold text-bank-primary">
                  ${portfolioValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="text-sm text-muted-foreground">USD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading transactions...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No crypto transactions found.</p>
                <p className="text-sm text-muted-foreground">Send some {symbol} to create your first transaction!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.name}</span>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.transaction_date).toLocaleDateString()} • {transaction.recipient_bank_name}
                        </div>
                        {transaction.recipient_name && (
                          <div className="text-xs text-muted-foreground">
                            To: {transaction.recipient_name}
                          </div>
                        )}
                        {transaction.recipient_swift_code && (
                          <div className="text-xs text-blue-600">
                            Tx: {transaction.recipient_swift_code}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-medium text-red-600">
                          {transaction.amount} {symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.category}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateProofOfPayment(transaction, symbol || 'BTC', crypto.price)}
                        >
                          <Receipt className="h-3 w-3 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CryptoDetailsPage;
