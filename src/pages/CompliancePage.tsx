import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Shield, AlertTriangle, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const CompliancePage = () => {
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 30;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('TrustyBank Financial Institution', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('ANTI-MONEY LAUNDERING & COMPLIANCE DECLARATION', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Document Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    doc.text('Document Reference: TRB-AML-2024-001', pageWidth - margin, yPosition, { align: 'right' });
    
    yPosition += 20;
    
    // Content sections
    const content = [
      {
        title: '1. REGULATORY COMPLIANCE STATEMENT',
        text: 'TrustyBank operates under full compliance with the Financial Intelligence Centre Act (FICA) of South Africa, the Prevention of Organised Crime Act (POCA), and international FATF guidelines. All customer funds are subject to continuous monitoring and due diligence procedures.'
      },
      {
        title: '2. SOURCE OF FUNDS VERIFICATION',
        text: 'All funds displayed in customer accounts have been verified through our comprehensive Customer Due Diligence (CDD) process. Source verification includes: Employment verification, Business registration documents, Tax clearance certificates, Bank statements from legitimate financial institutions, and Asset valuation reports where applicable.'
      },
      {
        title: '3. ENHANCED DUE DILIGENCE (EDD)',
        text: 'High-value accounts undergo Enhanced Due Diligence including: Independent verification of wealth sources, Ongoing monitoring of transaction patterns, Regular review of customer risk profiles, and Automated suspicious activity detection systems.'
      },
      {
        title: '4. TRANSACTION MONITORING',
        text: 'All transactions are monitored using advanced AI-powered systems that: Identify unusual transaction patterns, Flag transactions above regulatory thresholds, Cross-reference against sanctions lists, and Generate automated Suspicious Transaction Reports (STRs) when required.'
      },
      {
        title: '5. RECORD KEEPING',
        text: 'TrustyBank maintains comprehensive records for a minimum of 5 years including: Customer identification documents, Transaction records and supporting documentation, Risk assessment reports, and All regulatory correspondence and filings.'
      },
      {
        title: '6. DECLARATION OF LEGITIMACY',
        text: 'We hereby declare that all funds held in TrustyBank accounts are of legitimate origin and have been obtained through lawful means. Any simulated or demonstration data is clearly marked and segregated from live customer data.'
      }
    ];

    content.forEach((section) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(section.title, margin, yPosition);
      yPosition += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitText = doc.splitTextToSize(section.text, pageWidth - 2 * margin);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 4 + 10;
    });

    // Footer
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 30;
    }
    
    yPosition += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text('AUTHORIZED SIGNATURES', margin, yPosition);
    yPosition += 20;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text('_________________________', margin, yPosition);
    doc.text('_________________________', pageWidth - margin - 60, yPosition);
    yPosition += 5;
    doc.text('Chief Compliance Officer', margin, yPosition);
    doc.text('Chief Executive Officer', pageWidth - margin - 60, yPosition);
    yPosition += 10;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 60, yPosition);

    // Save the PDF
    doc.save('TrustyBank-AML-Compliance-Declaration.pdf');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance & Legal Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Anti-Money Laundering and Financial Crime Prevention
          </p>
        </div>
        <Button onClick={downloadPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold">Regulatory Compliance</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            TrustyBank operates under strict compliance with South African and international 
            financial regulations, including FICA, POCA, and FATF guidelines.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Key Regulations:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Financial Intelligence Centre Act (FICA)</li>
                <li>• Prevention of Organised Crime Act (POCA)</li>
                <li>• Financial Action Task Force (FATF) Guidelines</li>
                <li>• South African Reserve Bank Regulations</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Compliance Measures:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Customer Due Diligence (CDD)</li>
                <li>• Enhanced Due Diligence (EDD)</li>
                <li>• Ongoing Transaction Monitoring</li>
                <li>• Suspicious Transaction Reporting</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Source of Funds Declaration</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            All funds displayed in customer accounts undergo rigorous verification processes 
            to ensure legitimate origins and compliance with anti-money laundering requirements.
          </p>
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Fund Verification Process:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Documentation Required:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Employment verification letters</li>
                  <li>• Business registration documents</li>
                  <li>• Tax clearance certificates</li>
                  <li>• Bank statements (6-12 months)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Verification Steps:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Independent source verification</li>
                  <li>• Risk assessment profiling</li>
                  <li>• Ongoing monitoring systems</li>
                  <li>• Regular compliance reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold">Anti-Fraud Measures</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            TrustyBank employs advanced technology and procedures to prevent financial crimes 
            and protect customer assets from fraudulent activities.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
              <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Detection Systems</h3>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• AI-powered pattern recognition</li>
                <li>• Real-time transaction analysis</li>
                <li>• Behavioral analytics</li>
              </ul>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
              <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Prevention Measures</h3>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Multi-factor authentication</li>
                <li>• Transaction limits and alerts</li>
                <li>• Device fingerprinting</li>
              </ul>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Response Protocols</h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Immediate account freezing</li>
                <li>• Law enforcement cooperation</li>
                <li>• Customer notification systems</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <h2 className="text-xl font-semibold mb-3">Legal Declaration</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This document serves as an official declaration that TrustyBank maintains full compliance 
            with all applicable financial regulations and anti-money laundering requirements. All 
            customer funds have been verified through proper due diligence procedures, and any 
            demonstration or simulated data is clearly segregated from live customer information. 
            This declaration is prepared in accordance with regulatory standards and is admissible 
            in legal proceedings as evidence of our compliance program.
          </p>
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded">
            <p className="text-xs text-green-800 dark:text-green-200">
              <strong>Certificate Number:</strong> TRB-AML-2024-001 | 
              <strong> Issue Date:</strong> {new Date().toLocaleDateString()} | 
              <strong> Valid Until:</strong> {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompliancePage;