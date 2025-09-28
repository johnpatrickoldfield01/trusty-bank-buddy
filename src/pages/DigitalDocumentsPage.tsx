import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileText, Shield, Plane, GraduationCap, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  type: 'passport' | 'id_card' | 'work_permit' | 'study_permit' | 'travel_permit';
  number: string;
  country: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  description: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    type: 'passport',
    number: 'M12345678',
    country: 'South Africa',
    issueDate: '2019-03-15',
    expiryDate: '2029-03-15',
    status: 'active',
    description: 'South African ordinary passport for international travel'
  },
  {
    id: '2',
    type: 'id_card',
    number: '8901015800087',
    country: 'South Africa',
    issueDate: '2020-01-15',
    expiryDate: '2030-01-15',
    status: 'active',
    description: 'South African Smart ID Card for domestic identification'
  },
  {
    id: '3',
    type: 'work_permit',
    number: 'WP2024001234',
    country: 'United Kingdom',
    issueDate: '2024-01-01',
    expiryDate: '2026-12-31',
    status: 'active',
    description: 'UK Skilled Worker Visa for employment in financial services'
  },
  {
    id: '4',
    type: 'study_permit',
    number: 'SP2023005678',
    country: 'Canada',
    issueDate: '2023-09-01',
    expiryDate: '2025-08-31',
    status: 'active',
    description: 'Canadian Study Permit for Masters in Business Administration'
  },
  {
    id: '5',
    type: 'travel_permit',
    number: 'TP2024009876',
    country: 'Schengen Area',
    issueDate: '2024-06-01',
    expiryDate: '2024-12-01',
    status: 'active',
    description: 'Schengen tourist visa for leisure travel across EU member states'
  }
];

const documentIcons = {
  passport: <FileText className="h-5 w-5" />,
  id_card: <Shield className="h-5 w-5" />,
  work_permit: <Briefcase className="h-5 w-5" />,
  study_permit: <GraduationCap className="h-5 w-5" />,
  travel_permit: <Plane className="h-5 w-5" />
};

const documentTitles = {
  passport: 'Digital Passport',
  id_card: 'ID Card',
  work_permit: 'Work Permit',
  study_permit: 'Study Permit',
  travel_permit: 'Travel/Vacation Permit'
};

const DigitalDocumentsPage = () => {
  const [documents] = useState<Document[]>(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleDownload = (doc: Document) => {
    toast({
      title: "Document Downloaded",
      description: `${documentTitles[doc.type]} (${doc.number}) has been downloaded securely.`,
    });
  };

  const handleUpload = () => {
    toast({
      title: "Upload Initiated",
      description: "Document upload process started. Please follow security protocols.",
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Digital Documents Management</h1>
        <p className="text-muted-foreground">
          Secure management of digital passports, ID cards, permits, and travel documents
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="passports">Passports</TabsTrigger>
          <TabsTrigger value="permits">Permits</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const daysUntilExpiry = getDaysUntilExpiry(doc.expiryDate);
              return (
                <Card key={doc.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDoc(doc)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {documentIcons[doc.type]}
                        <CardTitle className="text-lg">{documentTitles[doc.type]}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Number:</strong> {doc.number}</p>
                      <p className="text-sm"><strong>Country:</strong> {doc.country}</p>
                      <p className="text-sm"><strong>Expires:</strong> {doc.expiryDate}</p>
                      {daysUntilExpiry < 90 && daysUntilExpiry > 0 && (
                        <p className="text-sm text-orange-600 font-medium">
                          Expires in {daysUntilExpiry} days
                        </p>
                      )}
                      {daysUntilExpiry <= 0 && (
                        <p className="text-sm text-red-600 font-medium">Expired</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="passports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Digital Passports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.filter(doc => doc.type === 'passport' || doc.type === 'id_card').map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {documentIcons[doc.type]}
                      <div>
                        <h4 className="font-medium">{documentTitles[doc.type]} - {doc.number}</h4>
                        <p className="text-sm text-muted-foreground">{doc.country} • Expires: {doc.expiryDate}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleDownload(doc)} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work, Study & Travel Permits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.filter(doc => ['work_permit', 'study_permit', 'travel_permit'].includes(doc.type)).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {documentIcons[doc.type]}
                      <div>
                        <h4 className="font-medium">{documentTitles[doc.type]} - {doc.number}</h4>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                        <p className="text-xs text-muted-foreground">{doc.country} • {doc.issueDate} to {doc.expiryDate}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleDownload(doc)} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="docType">Document Type</Label>
                  <select className="w-full p-2 border rounded-md" id="docType">
                    <option value="">Select document type</option>
                    <option value="passport">Digital Passport</option>
                    <option value="id_card">ID Card</option>
                    <option value="work_permit">Work Permit</option>
                    <option value="study_permit">Study Permit</option>
                    <option value="travel_permit">Travel/Vacation Permit</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="country">Issuing Country</Label>
                  <Input id="country" placeholder="Enter issuing country" />
                </div>
                <div>
                  <Label htmlFor="docNumber">Document Number</Label>
                  <Input id="docNumber" placeholder="Enter document number" />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" type="date" />
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Drag and drop your document or</p>
                <Button onClick={handleUpload} className="mt-2">Choose File</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Encryption Standards</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• AES-256 encryption for all stored documents</li>
                    <li>• End-to-end encryption for document transfers</li>
                    <li>• Blockchain verification for authenticity</li>
                    <li>• Multi-factor authentication required</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Compliance Standards</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• GDPR compliant data processing</li>
                    <li>• ISO 27001 security management</li>
                    <li>• ICAO standards for digital passports</li>
                    <li>• Regular security audits and monitoring</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Access Controls</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Biometric authentication supported</li>
                    <li>• Role-based access permissions</li>
                    <li>• Audit trail for all document access</li>
                    <li>• Time-limited access tokens</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Document Verification</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Real-time verification with issuing authorities</li>
                    <li>• Digital signatures and timestamps</li>
                    <li>• Tamper-evident document storage</li>
                    <li>• Cross-border verification protocols</li>
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

export default DigitalDocumentsPage;