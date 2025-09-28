import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Shield, FileText, Award } from 'lucide-react';
import jsPDF from 'jspdf';

const ComplianceCertificate = () => {
  const generateComplianceCertificate = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BANKING COMPLIANCE CERTIFICATE', 105, 30, { align: 'center' });
    
    // Subheader
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('TrustyBank Financial Services', 105, 45, { align: 'center' });
    
    // License Number
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('License Number: FSP-2024-TB-001', 20, 65);
    doc.setFont('helvetica', 'normal');
    
    // Certificate Body
    doc.text('This is to certify that TrustyBank Financial Services is duly licensed and', 20, 85);
    doc.text('authorized to conduct banking and financial services operations under the', 20, 95);
    doc.text('following regulatory frameworks:', 20, 105);
    
    // Regulatory Compliance List
    const regulations = [
      '• South African Reserve Bank (SARB) Banking License',
      '• Financial Intelligence Centre Act (FICA) Compliance',
      '• Protection of Personal Information Act (POPIA) Certification',
      '• Basel III Capital Requirements Directive',
      '• Anti-Money Laundering (AML) Compliance Certificate',
      '• Know Your Customer (KYC) Protocol Certification',
      '• Payment Card Industry Data Security Standard (PCI DSS)',
      '• International Organization for Standardization (ISO 27001)'
    ];
    
    let yPosition = 120;
    regulations.forEach(regulation => {
      doc.text(regulation, 25, yPosition);
      yPosition += 10;
    });
    
    // Validity Section
    doc.setFont('helvetica', 'bold');
    doc.text('VALIDITY AND SCOPE:', 20, yPosition + 15);
    doc.setFont('helvetica', 'normal');
    yPosition += 25;
    
    doc.text('This certificate is valid from January 1, 2024 to December 31, 2025', 20, yPosition);
    doc.text('and covers all digital banking operations, payments processing,', 20, yPosition + 10);
    doc.text('foreign exchange services, and cryptocurrency transactions.', 20, yPosition + 20);
    
    // Signatures Section
    yPosition += 45;
    doc.setFont('helvetica', 'bold');
    doc.text('AUTHORIZED SIGNATURES:', 20, yPosition);
    
    // Signature lines
    doc.line(20, yPosition + 25, 90, yPosition + 25);
    doc.line(110, yPosition + 25, 180, yPosition + 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Chief Compliance Officer', 20, yPosition + 35);
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, yPosition + 45);
    
    doc.text('Regulatory Affairs Director', 110, yPosition + 35);
    doc.text('Date: ' + new Date().toLocaleDateString(), 110, yPosition + 45);
    
    // Footer
    doc.setFontSize(8);
    doc.text('This certificate is generated electronically and is valid without physical signature.', 105, 280, { align: 'center' });
    doc.text('For verification, contact compliance@trustybank.com or visit www.trustybank.com/compliance', 105, 285, { align: 'center' });
    
    // Download the PDF
    doc.save('TrustyBank_Compliance_Certificate.pdf');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Banking Compliance Certificate</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">SARB Licensed</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">FICA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">PCI DSS Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">ISO 27001 Certified</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">AML Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">KYC Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">POPIA Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Basel III Compliant</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-2">Certificate Details</h4>
                <p className="text-sm text-muted-foreground">
                  This official compliance certificate validates TrustyBank's adherence to all 
                  South African banking regulations and international financial standards. 
                  The certificate includes our banking license, regulatory compliance status, 
                  and security certifications.
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={generateComplianceCertificate}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Official Compliance Certificate (PDF)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceCertificate;