import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileText, Shield, Plane, GraduationCap, Briefcase, Trash2, Loader2 } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useForm } from 'react-hook-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const documentIcons = {
  passport: <FileText className="h-5 w-5" />,
  id_card: <Shield className="h-5 w-5" />,
  work_permit: <Briefcase className="h-5 w-5" />,
  study_permit: <GraduationCap className="h-5 w-5" />,
  travel_permit: <Plane className="h-5 w-5" />,
  drivers_license: <Shield className="h-5 w-5" />
};

const documentTitles = {
  passport: 'Digital Passport',
  id_card: 'ID Card',
  work_permit: 'Work Permit',
  study_permit: 'Study Permit',
  travel_permit: 'Travel/Vacation Permit',
  drivers_license: 'Driver\'s License'
};

interface UploadFormData {
  document_type: string;
  document_number: string;
  country: string;
  issue_date: string;
  expiry_date: string;
  description?: string;
}

const DigitalDocumentsPage = () => {
  const { documents, loading, uploadDocument, downloadDocument, deleteDocument } = useDocuments();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UploadFormData>();

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

  const handleDownload = (doc: any) => {
    downloadDocument(doc);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!fileInputRef.current?.files?.[0]) {
      return;
    }

    setUploading(true);
    const file = fileInputRef.current.files[0];
    const success = await uploadDocument(file, data);
    
    if (success) {
      reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setUploading(false);
  };

  const handleDelete = (documentId: string) => {
    deleteDocument(documentId);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Digital Documents Management</h1>
        <p className="text-muted-foreground">
          Secure management of digital passports, ID cards, permits, and travel documents
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="passports">Passports</TabsTrigger>
          <TabsTrigger value="permits">Permits</TabsTrigger>
          <TabsTrigger value="drivers">Driver's License</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {documents.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
                <p className="text-muted-foreground mb-4">Upload your first document to get started</p>
                <Button onClick={() => {
                  const uploadTab = window.document.querySelector('[data-value="upload"]') as HTMLElement;
                  uploadTab?.click();
                }}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => {
                const daysUntilExpiry = getDaysUntilExpiry(doc.expiry_date);
                return (
                  <Card key={doc.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDoc(doc)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {documentIcons[doc.document_type as keyof typeof documentIcons] || <FileText className="h-5 w-5" />}
                          <CardTitle className="text-lg">{documentTitles[doc.document_type as keyof typeof documentTitles] || doc.document_type}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this document? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(doc.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Number:</strong> {doc.document_number}</p>
                        <p className="text-sm"><strong>Country:</strong> {doc.country}</p>
                        <p className="text-sm"><strong>Expires:</strong> {doc.expiry_date}</p>
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
          )}
        </TabsContent>

        <TabsContent value="passports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Digital Passports & ID Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.filter(doc => doc.document_type === 'passport' || doc.document_type === 'id_card').length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No passports or ID cards uploaded yet.</p>
                ) : (
                  documents.filter(doc => doc.document_type === 'passport' || doc.document_type === 'id_card').map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {documentIcons[doc.document_type as keyof typeof documentIcons] || <FileText className="h-5 w-5" />}
                        <div>
                          <h4 className="font-medium">{documentTitles[doc.document_type as keyof typeof documentTitles] || doc.document_type} - {doc.document_number}</h4>
                          <p className="text-sm text-muted-foreground">{doc.country} • Expires: {doc.expiry_date}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleDownload(doc)} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))
                )}
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
                {documents.filter(doc => ['work_permit', 'study_permit', 'travel_permit'].includes(doc.document_type)).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No permits uploaded yet.</p>
                ) : (
                  documents.filter(doc => ['work_permit', 'study_permit', 'travel_permit'].includes(doc.document_type)).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {documentIcons[doc.document_type as keyof typeof documentIcons] || <FileText className="h-5 w-5" />}
                        <div>
                          <h4 className="font-medium">{documentTitles[doc.document_type as keyof typeof documentTitles] || doc.document_type} - {doc.document_number}</h4>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                          <p className="text-xs text-muted-foreground">{doc.country} • {doc.issue_date} to {doc.expiry_date}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleDownload(doc)} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver's Licenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.filter(doc => doc.document_type === 'drivers_license').length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No driver's licenses uploaded yet.</p>
                ) : (
                  documents.filter(doc => doc.document_type === 'drivers_license').map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {documentIcons.drivers_license}
                        <div>
                          <h4 className="font-medium">Driver's License - {doc.document_number}</h4>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                          <p className="text-xs text-muted-foreground">{doc.country} • {doc.issue_date} to {doc.expiry_date}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleDownload(doc)} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="document_type">Document Type *</Label>
                    <select 
                      {...register('document_type', { required: 'Document type is required' })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select document type</option>
                      <option value="passport">Digital Passport</option>
                      <option value="id_card">ID Card</option>
                      <option value="work_permit">Work Permit</option>
                      <option value="study_permit">Study Permit</option>
                      <option value="travel_permit">Travel/Vacation Permit</option>
                      <option value="drivers_license">Driver's License</option>
                    </select>
                    {errors.document_type && (
                      <p className="text-sm text-destructive mt-1">{errors.document_type.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Issuing Country *</Label>
                    <Input 
                      {...register('country', { required: 'Country is required' })}
                      placeholder="Enter issuing country" 
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="document_number">Document Number *</Label>
                    <Input 
                      {...register('document_number', { required: 'Document number is required' })}
                      placeholder="Enter document number" 
                    />
                    {errors.document_number && (
                      <p className="text-sm text-destructive mt-1">{errors.document_number.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="issue_date">Issue Date *</Label>
                    <Input 
                      {...register('issue_date', { required: 'Issue date is required' })}
                      type="date" 
                    />
                    {errors.issue_date && (
                      <p className="text-sm text-destructive mt-1">{errors.issue_date.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="expiry_date">Expiry Date *</Label>
                    <Input 
                      {...register('expiry_date', { required: 'Expiry date is required' })}
                      type="date" 
                    />
                    {errors.expiry_date && (
                      <p className="text-sm text-destructive mt-1">{errors.expiry_date.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input 
                      {...register('description')}
                      placeholder="Enter description" 
                    />
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload your document file</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        console.log('File selected:', e.target.files[0].name);
                      }
                    }}
                  />
                  <Button type="button" onClick={handleFileUpload} className="mt-2">
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </form>
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