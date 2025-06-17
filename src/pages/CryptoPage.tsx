
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const CryptoPage = () => {
  const navigate = useNavigate();
  
  const cryptocurrencies = [
    { rank: 1, name: 'Bitcoin', symbol: 'BTC', price: 43250.50, change: 2.34 },
    { rank: 2, name: 'Ethereum', symbol: 'ETH', price: 2680.75, change: -1.12 },
    { rank: 3, name: 'Tether', symbol: 'USDT', price: 1.00, change: 0.02 },
    { rank: 4, name: 'BNB', symbol: 'BNB', price: 315.20, change: 1.87 },
    { rank: 5, name: 'Solana', symbol: 'SOL', price: 98.45, change: 4.21 },
    { rank: 6, name: 'USDC', symbol: 'USDC', price: 1.00, change: -0.01 },
    { rank: 7, name: 'XRP', symbol: 'XRP', price: 0.62, change: -2.15 },
    { rank: 8, name: 'Dogecoin', symbol: 'DOGE', price: 0.095, change: 3.45 },
    { rank: 9, name: 'Cardano', symbol: 'ADA', price: 0.48, change: -0.89 },
    { rank: 10, name: 'Avalanche', symbol: 'AVAX', price: 37.82, change: 2.67 },
    { rank: 11, name: 'TRON', symbol: 'TRX', price: 0.105, change: 1.23 },
    { rank: 12, name: 'Chainlink', symbol: 'LINK', price: 14.56, change: -1.78 },
    { rank: 13, name: 'Polygon', symbol: 'MATIC', price: 0.89, change: 2.11 },
    { rank: 14, name: 'Wrapped Bitcoin', symbol: 'WBTC', price: 43180.25, change: 2.31 },
    { rank: 15, name: 'Polkadot', symbol: 'DOT', price: 6.78, change: -3.45 },
    { rank: 16, name: 'Litecoin', symbol: 'LTC', price: 73.42, change: 0.56 },
    { rank: 17, name: 'Internet Computer', symbol: 'ICP', price: 12.89, change: 4.67 },
    { rank: 18, name: 'Shiba Inu', symbol: 'SHIB', price: 0.000024, change: 5.23 },
    { rank: 19, name: 'Uniswap', symbol: 'UNI', price: 6.34, change: -2.87 },
    { rank: 20, name: 'Ethereum Classic', symbol: 'ETC', price: 20.45, change: 1.92 },
    { rank: 21, name: 'Dai', symbol: 'DAI', price: 1.00, change: 0.00 },
    { rank: 22, name: 'Cosmos', symbol: 'ATOM', price: 9.87, change: -1.45 },
    { rank: 23, name: 'Filecoin', symbol: 'FIL', price: 5.67, change: 3.21 },
    { rank: 24, name: 'Stellar', symbol: 'XLM', price: 0.124, change: -0.78 },
    { rank: 25, name: 'VeChain', symbol: 'VET', price: 0.032, change: 2.45 },
    { rank: 26, name: 'THETA', symbol: 'THETA', price: 1.23, change: -2.11 },
    { rank: 27, name: 'Monero', symbol: 'XMR', price: 158.90, change: 1.67 },
    { rank: 28, name: 'Algorand', symbol: 'ALGO', price: 0.18, change: -3.22 },
    { rank: 29, name: 'Hedera', symbol: 'HBAR', price: 0.065, change: 4.88 },
    { rank: 30, name: 'Flow', symbol: 'FLOW', price: 0.78, change: -1.33 }
  ];

  const balance = 1000000; // 1,000,000 units for each cryptocurrency

  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return price.toFixed(6);
    } else if (price < 1) {
      return price.toFixed(3);
    } else {
      return price.toFixed(2);
    }
  };

  const formatValue = (price: number) => {
    return (price * balance).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const totalPortfolioValue = cryptocurrencies.reduce((sum, crypto) => sum + (crypto.price * balance), 0);

  const handleRowClick = (symbol: string) => {
    navigate(`/crypto/${symbol.toLowerCase()}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cryptocurrency Portfolio</h1>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-bank-primary">
              {totalPortfolioValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 30 Cryptocurrencies</CardTitle>
          <p className="text-sm text-muted-foreground">
            Each cryptocurrency shows a balance of 1,000,000 units. Click on any row to view details.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Price (USD)</TableHead>
                <TableHead className="text-right">24h Change</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Value (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cryptocurrencies.map((crypto) => (
                <TableRow 
                  key={crypto.rank}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(crypto.symbol)}
                >
                  <TableCell className="font-medium">#{crypto.rank}</TableCell>
                  <TableCell className="font-medium">{crypto.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{crypto.symbol}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${formatPrice(crypto.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={crypto.change >= 0 ? "default" : "destructive"}>
                      {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {balance.toLocaleString()} {crypto.symbol}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatValue(crypto.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoPage;
