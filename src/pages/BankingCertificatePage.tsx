import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ComplianceCertificate from '@/components/compliance/ComplianceCertificate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Download } from 'lucide-react';

const BankingCertificatePage = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Banking License & Compliance</h1>
          <p className="text-muted-foreground">
            Official regulatory certifications and compliance documentation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-medium mb-2">SARB Licensed</h3>
              <p className="text-sm text-muted-foreground">
                Authorized by South African Reserve Bank
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Fully Compliant</h3>
              <p className="text-sm text-muted-foreground">
                All regulatory requirements met
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Download className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-medium mb-2">Download Certificate</h3>
              <p className="text-sm text-muted-foreground">
                Official PDF documentation available
              </p>
            </CardContent>
          </Card>
        </div>

        <ComplianceCertificate />
      </div>
  );
};

export default BankingCertificatePage;