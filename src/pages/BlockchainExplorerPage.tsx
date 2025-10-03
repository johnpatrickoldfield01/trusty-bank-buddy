import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

const ETHERSCAN_API_KEY = "4AGT9IE8EESEZH7BZH1CUIFMHH39X5C7XA";

export default function BlockchainExplorerPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionData, setTransactionData] = useState<any>(null);
  const [ethTransactionData, setEthTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ethereum");

  const searchEthTransaction = async (txHash: string) => {
    setLoading(true);
    setEthTransactionData(null);
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.result) {
        // Get transaction receipt for additional info
        const receiptResponse = await fetch(
          `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`
        );
        const receiptData = await receiptResponse.json();
        
        setEthTransactionData({
          transaction: data.result,
          receipt: receiptData.result
        });
        toast.success("Ethereum transaction found!");
      } else {
        toast.error("Transaction not found on Ethereum network");
      }
    } catch (error) {
      toast.error("Failed to fetch Ethereum transaction");
      console.error(error);
    }
    setLoading(false);
  };

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
      if (activeTab === "ethereum") {
        searchEthTransaction(searchTerm.trim());
      } else {
        searchTransaction(searchTerm.trim());
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Auto-search if identifier is provided in URL
  useEffect(() => {
    if (identifier) {
      setSearchTerm(identifier);
      if (identifier.startsWith('0x')) {
        setActiveTab("ethereum");
        searchEthTransaction(identifier);
      } else {
        searchTransaction(identifier);
      }
    }
  }, [identifier]);

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
            Blockchain Explorer
          </h1>
          <p className="text-muted-foreground">
            Search Ethereum transactions on Etherscan or mock Bitcoin transactions
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ethereum">Ethereum (Etherscan)</TabsTrigger>
                <TabsTrigger value="bitcoin">Bitcoin (Mock)</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <Input
                placeholder={
                  activeTab === "ethereum" 
                    ? "Enter Ethereum transaction hash (0x...)" 
                    : "Enter transaction ID or hash..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
            {activeTab === "ethereum" && (
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://etherscan.io/search?q=${searchTerm}`, '_blank')}
                  disabled={!searchTerm}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Etherscan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ethereum Transaction Details */}
        {ethTransactionData && activeTab === "ethereum" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Ethereum Transaction Details
                  <Badge variant={ethTransactionData.receipt ? 'default' : 'secondary'}>
                    {ethTransactionData.receipt ? 'Confirmed' : 'Pending'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-xs break-all">
                        {ethTransactionData.transaction.hash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(ethTransactionData.transaction.hash)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Block Number</label>
                    <p className="font-mono">
                      {ethTransactionData.transaction.blockNumber 
                        ? parseInt(ethTransactionData.transaction.blockNumber, 16)
                        : 'Pending'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">From</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-xs break-all">
                        {ethTransactionData.transaction.from}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(ethTransactionData.transaction.from)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">To</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-xs break-all">
                        {ethTransactionData.transaction.to || 'Contract Creation'}
                      </code>
                      {ethTransactionData.transaction.to && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(ethTransactionData.transaction.to)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Value</label>
                    <p className="font-mono">
                      {(parseInt(ethTransactionData.transaction.value, 16) / 1e18).toFixed(6)} ETH
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gas Price</label>
                    <p className="font-mono">
                      {(parseInt(ethTransactionData.transaction.gasPrice, 16) / 1e9).toFixed(2)} Gwei
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gas Limit</label>
                    <p className="font-mono">
                      {parseInt(ethTransactionData.transaction.gas, 16).toLocaleString()}
                    </p>
                  </div>
                  
                  {ethTransactionData.receipt && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Gas Used</label>
                        <p className="font-mono">
                          {parseInt(ethTransactionData.receipt.gasUsed, 16).toLocaleString()}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <Badge variant={ethTransactionData.receipt.status === '0x1' ? 'default' : 'destructive'}>
                          {ethTransactionData.receipt.status === '0x1' ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Confirmations</label>
                        <p className="font-mono">
                          {ethTransactionData.receipt.blockNumber ? '6+' : '0'}
                        </p>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nonce</label>
                    <p className="font-mono">
                      {parseInt(ethTransactionData.transaction.nonce, 16)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Transaction Index</label>
                    <p className="font-mono">
                      {ethTransactionData.transaction.transactionIndex 
                        ? parseInt(ethTransactionData.transaction.transactionIndex, 16)
                        : 'Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://etherscan.io/tx/${ethTransactionData.transaction.hash}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Etherscan
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {ethTransactionData.transaction.input && ethTransactionData.transaction.input !== '0x' && (
              <Card>
                <CardHeader>
                  <CardTitle>Input Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="bg-muted px-2 py-1 rounded text-xs break-all block">
                    {ethTransactionData.transaction.input}
                  </code>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Bitcoin Transaction Details */}
        {transactionData && activeTab === "bitcoin" && (
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
        {!transactionData && !ethTransactionData && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Enter a transaction hash to view details
              </p>
              {activeTab === "ethereum" ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Example Ethereum hash: 0xa3552867d759...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Using Etherscan API to fetch real Ethereum transaction data
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Example Bitcoin: BXLC2CJ7HNB88UIYAMQN
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}