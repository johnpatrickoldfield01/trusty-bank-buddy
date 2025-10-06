import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CryptoErrorDiagnosticTemplate } from '@/components/crypto/CryptoErrorDiagnosticTemplate';
import { AlertCircle, FileText } from 'lucide-react';

const CryptoDiagnosticsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <div>
          <h1 className="text-3xl font-bold">Cryptocurrency Error Diagnostics</h1>
          <p className="text-muted-foreground">
            Tools for debugging and reporting cryptocurrency transaction issues
          </p>
        </div>
      </div>

      <Tabs defaultValue="template" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="template">
            <FileText className="w-4 h-4 mr-2" />
            PDF Template
          </TabsTrigger>
          <TabsTrigger value="online">
            <AlertCircle className="w-4 h-4 mr-2" />
            Online Form (Coming Soon)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="mt-6">
          <CryptoErrorDiagnosticTemplate />
          
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">How to Use the PDF Template</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click "Generate PDF Template" to download the blank template</li>
              <li>Share the PDF with your engineering teams (Luno, Blockchain, Bank)</li>
              <li>Each team fills in their respective sections with technical details</li>
              <li>Use the sample code snippets as reference for the required data format</li>
              <li>Compile all responses for root cause analysis and resolution planning</li>
            </ol>
          </Card>
        </TabsContent>

        <TabsContent value="online" className="mt-6">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Online Form Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              An interactive online form where teams can collaborate in real-time
              is currently in development. For now, please use the PDF template.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium">Luno Support</p>
            <p className="text-muted-foreground">Contact your Luno account manager</p>
          </div>
          <div>
            <p className="font-medium">Blockchain Explorer</p>
            <p className="text-muted-foreground">Verify transactions on-chain</p>
          </div>
          <div>
            <p className="font-medium">Bank Integration</p>
            <p className="text-muted-foreground">Review settlement status</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CryptoDiagnosticsPage;
