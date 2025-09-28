import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export default function BlockchainExplorerPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const searchTransaction = async (searchId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/${searchId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTransactionData(data);
      } else {
        // Try searching by hash
        const hashResponse = await fetch(
          `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/hash/${searchId}`
        );
        
        if (hashResponse.ok) {
          const data = await hashResponse.json();
          setTransactionData(data);
        } else {
          toast.error("Transaction not found");
          setTransactionData(null);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch transaction data");
      setTransactionData(null);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchTransaction(searchTerm.trim());
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Auto-search if identifier is provided in URL
  useState(() => {
    if (identifier) {
      setSearchTerm(identifier);
      searchTransaction(identifier);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mock Bitcoin Explorer
          </h1>
          <p className="text-muted-foreground">
            Simulated blockchain explorer for testing cryptocurrency transactions
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter transaction ID or hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        {transactionData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Transaction Details
                  <Badge variant={transactionData.status === 'confirmed' ? 'default' : 'secondary'}>
                    {transactionData.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{transactionData.txid}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transactionData.txid)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{transactionData.hash}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transactionData.hash)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Block Height</label>
                    <p className="font-mono">{transactionData.blockHeight}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Confirmations</label>
                    <p className="font-mono">{transactionData.confirmations}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fee</label>
                    <p className="font-mono">{transactionData.fee} BTC</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Size</label>
                    <p className="font-mono">{transactionData.size} bytes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inputs and Outputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inputs</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionData.inputs?.map((input: any, index: number) => (
                    <div key={index} className="border rounded p-3">
                      <p className="text-sm font-medium">Value: {input.value} BTC</p>
                      <p className="text-xs text-muted-foreground font-mono">{input.txid}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outputs</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionData.outputs?.map((output: any, index: number) => (
                    <div key={index} className="border rounded p-3">
                      <p className="text-sm font-medium">Value: {output.value} BTC</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {output.scriptPubKey?.addresses?.[0]}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Explorer Metadata */}
            {transactionData.explorer_metadata && (
              <Card>
                <CardHeader>
                  <CardTitle>Network Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Network</label>
                      <p>{transactionData.explorer_metadata.network_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Block Height</label>
                      <p>{transactionData.explorer_metadata.blockchain_info?.current_block_height}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                      <Badge variant="default">
                        {transactionData.explorer_metadata.verification_status?.finality_status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{new Date(transactionData.explorer_metadata.last_updated).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alternative URLs */}
            {transactionData.alternative_formats && (
              <Card>
                <CardHeader>
                  <CardTitle>Alternative Explorer URLs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {transactionData.alternative_formats.map((url: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Format {index + 1}
                      </Button>
                      <code className="text-xs text-muted-foreground">{url}</code>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Default info if no transaction */}
        {!transactionData && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Enter a transaction ID or hash to view details
              </p>
              <p className="text-sm text-muted-foreground">
                Example: BXLC2CJ7HNB88UIYAMQN or 0xa3552867d759
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}