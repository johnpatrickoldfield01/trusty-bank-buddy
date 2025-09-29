import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Download, Database, Shield, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ComplianceLetterPDFGenerator from './ComplianceLetterPDFGenerator';

interface ComplianceError {
  id: string;
  errorCode: string;
  errorMessage: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'database' | 'compliance' | 'api' | 'regulatory';
  description: string;
  resolution: string;
  baasRequest?: string;
  timeoutCode?: number;
  lastOccurred: string;
  affectedTransfers: number;
}

const predefinedErrors: ComplianceError[] = [
  {
    id: '1',
    errorCode: 'ERR_DB_CONN_TIMEOUT',
    errorMessage: 'Timeout connecting to receiver bank database',
    severity: 'critical',
    category: 'database',
    description: 'Connection timeout occurred when attempting to establish database connection with receiving bank system',
    resolution: 'Request primary database connection parameters and timeout configurations from receiving bank technical team',
    baasRequest: 'REQUEST: Primary database endpoint, connection pool settings, timeout thresholds, and failover configurations',
    timeoutCode: 504,
    lastOccurred: new Date().toISOString(),
    affectedTransfers: 23
  },
  {
    id: '2',
    errorCode: 'ERR_INVALID_ACCOUNT_REF',
    errorMessage: 'Destination account reference not found in contra tables',
    severity: 'high',
    category: 'database',
    description: 'Beneficiary account reference cannot be located in receiving bank contra/lookup tables',
    resolution: 'Request foreign key mappings and account reference validation schemas from receiving bank',
    baasRequest: 'REQUEST: Account reference table schema, foreign key constraints, and account validation procedures',
    timeoutCode: 422,
    lastOccurred: new Date().toISOString(),
    affectedTransfers: 47
  },
  {
    id: '3',
    errorCode: 'ERR_BAL_UPDATE_FAIL',
    errorMessage: 'Conflict on balance update query, possibly due to pending compliance flag',
    severity: 'high',
    category: 'compliance',
    description: 'Balance update operation conflicts with existing compliance review processes',
    resolution: 'Request compliance workflow status and balance update trigger specifications',
    baasRequest: 'REQUEST: Compliance flag management procedures, balance update triggers, and conflict resolution protocols',
    timeoutCode: 409,
    lastOccurred: new Date().toISOString(),
    affectedTransfers: 12
  },
  {
    id: '4',
    errorCode: 'ERR_API_AUTH_DENIED',
    errorMessage: 'API request rejected due to missing/invalid credentials',
    severity: 'critical',
    category: 'api',
    description: 'Authentication credentials insufficient or expired for BaaS API access',
    resolution: 'Request updated API credentials and authentication token refresh procedures',
    baasRequest: 'REQUEST: Updated API credentials, token refresh endpoints, and authentication scope configurations',
    timeoutCode: 401,
    lastOccurred: new Date().toISOString(),
    affectedTransfers: 89
  },
  {
    id: '5',
    errorCode: 'ERR_REGULATORY_REVIEW_PENDING',
    errorMessage: 'Transaction pending regulatory compliance review',
    severity: 'medium',
    category: 'regulatory',
    description: 'Transfer requires additional regulatory documentation before processing',
    resolution: 'Submit NCR number, FSP license, and banking license documentation',
    baasRequest: 'REQUEST: Regulatory compliance workflow status and required documentation specifications',
    timeoutCode: 423,
    lastOccurred: new Date().toISOString(),
    affectedTransfers: 5
  },
  {
    id: '6',
    errorCode: 'ERR_RETRY_LIMIT_EXCEEDED',
    errorMessage: 'Maximum retry attempts exceeded for transfer processing',
    severity: 'high',
    category: 'database',
    description: 'Transfer has exceeded maximum retry attempts due to persistent technical issues',
    resolution: 'Manual intervention required - escalate to bank technical operations team',
    baasRequest: 'REQUEST: Retry configuration parameters, exponential backoff settings, and manual override procedures',
    timeoutCode: 429,
    lastOccurred: new Date().toISOString(),
    affectedTransfers: 34
  }
];

const ComplianceErrorTracker = () => {
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('errors');

  const handleErrorSelection = (errorId: string) => {
    setSelectedErrors(prev => 
      prev.includes(errorId) 
        ? prev.filter(id => id !== errorId)
        : [...prev, errorId]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'api': return <RefreshCw className="h-4 w-4" />;
      case 'regulatory': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const selectedErrorData = predefinedErrors.filter(error => selectedErrors.includes(error.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-medium">Compliance & Technical Error Monitor</h3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {selectedErrors.length} Selected
          </Badge>
          {selectedErrors.length > 0 && (
            <ComplianceLetterPDFGenerator
              selectedErrors={selectedErrorData}
              onDownload={() => toast.success('Compliance letter downloaded successfully')}
            />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="errors">Error Catalog</TabsTrigger>
          <TabsTrigger value="database">Database Issues</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="baas">BaaS Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid gap-4">
            {predefinedErrors.map((error) => (
              <Card key={error.id} className={`cursor-pointer transition-all ${
                selectedErrors.includes(error.id) ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedErrors.includes(error.id)}
                          onChange={() => handleErrorSelection(error.id)}
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(error.category)}
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {error.errorCode}
                          </code>
                          <Badge variant={getSeverityColor(error.severity)}>
                            {error.severity}
                          </Badge>
                          <Badge variant="outline">
                            HTTP {error.timeoutCode}
                          </Badge>
                        </div>
                      </div>
                      
                      <h4 className="font-medium">{error.errorMessage}</h4>
                      <p className="text-sm text-muted-foreground">{error.description}</p>
                      
                      <div className="text-sm">
                        <strong>Resolution:</strong> {error.resolution}
                      </div>
                      
                      {error.baasRequest && (
                        <div className="text-sm bg-muted p-2 rounded">
                          <strong>BaaS Request:</strong> {error.baasRequest}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Affected Transfers: {error.affectedTransfers}</span>
                        <span>Last Occurred: {new Date(error.lastOccurred).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4">
            {predefinedErrors.filter(e => e.category === 'database').map((error) => (
              <Card key={error.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {error.errorCode}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p>{error.description}</p>
                    <div className="bg-muted p-3 rounded">
                      <strong>Technical Resolution:</strong> {error.resolution}
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <strong>BaaS Arbitrage Request:</strong> {error.baasRequest}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4">
            {predefinedErrors.filter(e => e.category === 'compliance' || e.category === 'regulatory').map((error) => (
              <Card key={error.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {error.errorCode}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p>{error.description}</p>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>Regulatory Requirement:</strong> {error.resolution}
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <strong>Bank Documentation Request:</strong> {error.baasRequest}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="baas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>BaaS Arbitrage Information Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Primary & Foreign Key Schema Requests</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Account reference table primary keys and constraints</li>
                    <li>• Foreign key relationships between transaction and account tables</li>
                    <li>• Database schema documentation for contra table mappings</li>
                    <li>• Index configurations for performance optimization</li>
                  </ul>
                </div>
                
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">API Configuration Requests</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Authentication endpoint specifications and token refresh intervals</li>
                    <li>• Rate limiting configurations and retry policies</li>
                    <li>• Webhook endpoints for real-time transaction status updates</li>
                    <li>• API versioning and backward compatibility documentation</li>
                  </ul>
                </div>
                
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Compliance Workflow Requests</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Regulatory compliance flag management procedures</li>
                    <li>• SARB reporting workflow and escalation paths</li>
                    <li>• Required documentation for NCR, FSP, and banking license verification</li>
                    <li>• Audit trail requirements and retention policies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceErrorTracker;