import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Shield, Lock, Eye, AlertTriangle, FileCheck, Database, Network } from 'lucide-react';
import jsPDF from 'jspdf';

const SecurityProtocolsPage = () => {
  const downloadSecurityPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 30;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('TrustyBank Security Protocols & Standards', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('COMPREHENSIVE SECURITY FRAMEWORK DOCUMENTATION', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Document Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    doc.text('Document Reference: TRB-SEC-2024-001', pageWidth - margin, yPosition, { align: 'right' });
    
    yPosition += 20;
    
    // Content sections
    const securityContent = [
      {
        title: '1. ENCRYPTION STANDARDS',
        text: 'TrustyBank implements military-grade encryption protocols: AES-256 encryption for data at rest, TLS 1.3 for data in transit, End-to-end encryption for all customer communications, RSA-4096 for key exchange protocols, and Quantum-resistant cryptographic algorithms preparation for future security needs.'
      },
      {
        title: '2. ACCESS CONTROL FRAMEWORK',
        text: 'Multi-layered access control systems ensure data protection: Zero-trust security architecture, Multi-factor authentication (MFA) mandatory for all users, Role-based access control (RBAC) with principle of least privilege, Biometric authentication for high-security operations, and Regular access review and de-provisioning procedures.'
      },
      {
        title: '3. NETWORK SECURITY PROTOCOLS',
        text: 'Advanced network protection measures: Next-generation firewalls with deep packet inspection, Intrusion Detection and Prevention Systems (IDS/IPS), DDoS protection with automatic traffic filtering, Network segmentation and micro-segmentation, VPN-only access for remote connections, and Real-time network monitoring and threat detection.'
      },
      {
        title: '4. DATA PROTECTION & PRIVACY',
        text: 'Comprehensive data protection framework: GDPR and POPIA compliance for personal data processing, Data classification and labeling systems, Automated data loss prevention (DLP) solutions, Regular data backup with 3-2-1 backup strategy, Secure data disposal and destruction procedures, and Privacy by design implementation across all systems.'
      },
      {
        title: '5. INCIDENT RESPONSE PROTOCOLS',
        text: 'Structured incident response framework: 24/7 Security Operations Center (SOC) monitoring, Automated threat detection and response systems, Incident classification and escalation procedures, Forensic investigation capabilities, Customer notification protocols within regulatory timeframes, and Post-incident analysis and improvement processes.'
      },
      {
        title: '6. COMPLIANCE & AUDITING',
        text: 'Regular security assessments and compliance verification: Annual third-party security audits, Penetration testing and vulnerability assessments, ISO 27001 certification maintenance, PCI DSS compliance for payment processing, SWIFT Customer Security Programme (CSP) adherence, and Continuous compliance monitoring and reporting.'
      },
      {
        title: '7. EMPLOYEE SECURITY TRAINING',
        text: 'Comprehensive security awareness program: Monthly security training sessions, Phishing simulation and testing programs, Secure coding practices for development teams, Background checks and security clearance procedures, Regular security policy updates and acknowledgments, and Insider threat detection and prevention measures.'
      }
    ];

    securityContent.forEach((section) => {
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

    // Security Certificate Section
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 30;
    }
    
    yPosition += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('SECURITY CERTIFICATION STATEMENT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const certText = 'This document certifies that TrustyBank has implemented and maintains comprehensive security protocols that meet or exceed industry standards including ISO 27001, PCI DSS Level 1, and SWIFT CSP requirements. All security measures are regularly audited and updated to address emerging threats and regulatory requirements.';
    const splitCertText = doc.splitTextToSize(certText, pageWidth - 2 * margin);
    doc.text(splitCertText, margin, yPosition);
    yPosition += splitCertText.length * 4 + 20;
    
    // Signatures
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text('AUTHORIZED SIGNATURES', margin, yPosition);
    yPosition += 20;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text('_________________________', margin, yPosition);
    doc.text('_________________________', pageWidth - margin - 60, yPosition);
    yPosition += 5;
    doc.text('Chief Information Security Officer', margin, yPosition);
    doc.text('Chief Technology Officer', pageWidth - margin - 60, yPosition);
    yPosition += 10;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 60, yPosition);

    // Save the PDF
    doc.save('TrustyBank-Security-Protocols-2024.pdf');
  };

  const securityStandards = [
    {
      category: "Encryption Standards",
      standards: [
        { name: "AES-256", status: "Active", description: "Data at rest encryption" },
        { name: "TLS 1.3", status: "Active", description: "Data in transit protection" },
        { name: "RSA-4096", status: "Active", description: "Key exchange protocol" },
        { name: "Post-Quantum Crypto", status: "Preparing", description: "Future-ready algorithms" }
      ],
      icon: <Lock className="h-5 w-5" />
    },
    {
      category: "Access Control",
      standards: [
        { name: "Zero Trust Architecture", status: "Active", description: "Never trust, always verify" },
        { name: "Multi-Factor Authentication", status: "Active", description: "Enhanced login security" },
        { name: "RBAC Implementation", status: "Active", description: "Role-based permissions" },
        { name: "Biometric Authentication", status: "Active", description: "High-security operations" }
      ],
      icon: <Eye className="h-5 w-5" />
    },
    {
      category: "Network Security",
      standards: [
        { name: "Next-Gen Firewalls", status: "Active", description: "Advanced threat protection" },
        { name: "IDS/IPS Systems", status: "Active", description: "Intrusion detection/prevention" },
        { name: "DDoS Protection", status: "Active", description: "Traffic filtering & mitigation" },
        { name: "Network Segmentation", status: "Active", description: "Isolated security zones" }
      ],
      icon: <Network className="h-5 w-5" />
    },
    {
      category: "Data Protection",
      standards: [
        { name: "GDPR Compliance", status: "Active", description: "EU data protection regulation" },
        { name: "POPIA Compliance", status: "Active", description: "SA personal information act" },
        { name: "Data Loss Prevention", status: "Active", description: "Automated DLP solutions" },
        { name: "3-2-1 Backup Strategy", status: "Active", description: "Comprehensive data backup" }
      ],
      icon: <Database className="h-5 w-5" />
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case "Preparing":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Preparing</Badge>;
      case "Updating":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Updating</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Protocols & Standards</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive security framework and encryption protocols
          </p>
        </div>
        <Button onClick={downloadSecurityPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Security PDF
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Security Status</p>
              <p className="font-semibold text-green-600">Optimal</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Encryption Level</p>
              <p className="font-semibold">AES-256</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FileCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compliance</p>
              <p className="font-semibold">ISO 27001</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Threat Level</p>
              <p className="font-semibold text-green-600">Low</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Standards Detail */}
      <div className="space-y-6">
        {securityStandards.map((category, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {category.icon}
              </div>
              <h2 className="text-xl font-semibold">{category.category}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {category.standards.map((standard, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h3 className="font-medium">{standard.name}</h3>
                    <p className="text-sm text-muted-foreground">{standard.description}</p>
                  </div>
                  {getStatusBadge(standard.status)}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Encryption Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Encryption Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Encryption Status: Active</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              All customer data is encrypted using AES-256 encryption standards. Your information is protected both in transit and at rest.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800 dark:text-green-200">TLS 1.3 Connection Secured</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your connection to TrustyBank is secured with the latest TLS 1.3 protocol, ensuring maximum protection during data transmission.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-purple-800 dark:text-purple-200">Quantum-Ready Security</span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              TrustyBank is preparing for post-quantum cryptography to ensure your data remains secure against future quantum computing threats.
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-orange-800 dark:text-orange-200">Security Monitoring Active</span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Our 24/7 Security Operations Center continuously monitors for threats and anomalies to protect your financial data.
            </p>
          </div>
        </div>
      </Card>

      {/* Compliance Certifications */}
      <Card className="p-6 border-l-4 border-l-blue-500">
        <h2 className="text-xl font-semibold mb-3">Security Certifications & Compliance</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium">ISO 27001</h3>
            <p className="text-sm text-muted-foreground">Information Security Management</p>
            <Badge className="mt-2 bg-green-100 text-green-800">Certified</Badge>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <FileCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium">PCI DSS Level 1</h3>
            <p className="text-sm text-muted-foreground">Payment Card Industry</p>
            <Badge className="mt-2 bg-green-100 text-green-800">Compliant</Badge>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Network className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium">SWIFT CSP</h3>
            <p className="text-sm text-muted-foreground">Customer Security Programme</p>
            <Badge className="mt-2 bg-green-100 text-green-800">Verified</Badge>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Security Certificate Number:</strong> TRB-SEC-2024-001 | 
            <strong> Issue Date:</strong> {new Date().toLocaleDateString()} | 
            <strong> Next Audit:</strong> December 31, 2030
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SecurityProtocolsPage;