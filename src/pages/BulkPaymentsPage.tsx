import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import BeneficiaryManager from '@/components/banking/BeneficiaryManager';
import BulkPaymentScheduler from '@/components/banking/BulkPaymentScheduler';
import TransferErrorMonitor from '@/components/banking/TransferErrorMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BulkPaymentsPage = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bulk Payments & Beneficiaries</h1>
          <p className="text-muted-foreground">
            Manage KYC-verified beneficiaries, schedule bulk payments, and monitor transfer errors
          </p>
        </div>

        <Tabs defaultValue="beneficiaries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
            <TabsTrigger value="scheduler">Bulk Scheduler</TabsTrigger>
            <TabsTrigger value="errors">Error Monitor</TabsTrigger>
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
        </Tabs>
      </div>
  );
};

export default BulkPaymentsPage;