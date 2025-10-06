import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import BeneficiaryManager from '@/components/banking/BeneficiaryManager';
import BulkPaymentScheduler from '@/components/banking/BulkPaymentScheduler';
import TransferErrorMonitor from '@/components/banking/TransferErrorMonitor';
import ComplianceErrorTracker from '@/components/banking/ComplianceErrorTracker';
import ComplianceEmailSender from '@/components/banking/ComplianceEmailSender';
import { BankEngineeringDiagnosticTemplate } from '@/components/banking/BankEngineeringDiagnosticTemplate';
import { BankErrorHistoryDownloader } from '@/components/banking/BankErrorHistoryDownloader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const BulkPaymentsPage = () => {
  const [selectedErrors, setSelectedErrors] = useState<ComplianceError[]>([]);

  return (
    <div className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bulk Payments & Beneficiaries</h1>
          <p className="text-muted-foreground">
            Manage KYC-verified beneficiaries, schedule bulk payments, and monitor transfer errors
          </p>
        </div>

        <Tabs defaultValue="beneficiaries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
            <TabsTrigger value="scheduler">Bulk Scheduler</TabsTrigger>
            <TabsTrigger value="errors">Error Monitor</TabsTrigger>
            <TabsTrigger value="compliance">Compliance & BaaS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="beneficiaries" className="space-y-4">
            <BeneficiaryManager />
          </TabsContent>
          
          <TabsContent value="scheduler" className="space-y-4">
            <BulkPaymentScheduler />
          </TabsContent>
          
          <TabsContent value="errors" className="space-y-4">
            <TransferErrorMonitor />
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-6">
            <ComplianceErrorTracker 
              selectedErrors={selectedErrors}
              onErrorSelectionChange={setSelectedErrors}
            />
            <ComplianceEmailSender selectedErrors={selectedErrors} />
            <BankEngineeringDiagnosticTemplate />
            <BankErrorHistoryDownloader />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default BulkPaymentsPage;