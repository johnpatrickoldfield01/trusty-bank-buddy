import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProofOfPaymentUploaderProps {
  onDocumentsUploaded?: (documents: UploadedDocument[]) => void;
  className?: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

const ProofOfPaymentUploader = ({ onDocumentsUploaded, className }: ProofOfPaymentUploaderProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload documents');
        return;
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/proof-of-payment-${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('proof-of-payments')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('proof-of-payments')
          .getPublicUrl(fileName);

        return {
          id: data.path,
          name: file.name,
          url: publicUrl,
          uploadedAt: new Date().toISOString()
        };
      });

      const uploadedDocuments = await Promise.all(uploadPromises);
      const newFiles = [...uploadedFiles, ...uploadedDocuments];
      
      setUploadedFiles(newFiles);
      
      if (onDocumentsUploaded) {
        onDocumentsUploaded(newFiles);
      }

      toast.success(`${uploadedDocuments.length} document(s) uploaded successfully`);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (document: UploadedDocument) => {
    try {
      const { error } = await supabase.storage
        .from('proof-of-payments')
        .remove([document.id]);

      if (error) {
        console.error('Delete error:', error);
        toast.error('Failed to remove document');
        return;
      }

      const newFiles = uploadedFiles.filter(f => f.id !== document.id);
      setUploadedFiles(newFiles);
      
      if (onDocumentsUploaded) {
        onDocumentsUploaded(newFiles);
      }

      toast.success('Document removed successfully');
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Failed to remove document');
    }
  };

  const formatAndCombineDocuments = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload proof of payment documents first');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('format-proof-of-payments', {
        body: {
          documents: uploadedFiles
        }
      });

      if (error) {
        console.error('Format error:', error);
        toast.error('Failed to format documents');
        return;
      }

      // Download the formatted document
      const link = document.createElement('a');
      link.href = data.formattedDocumentUrl;
      link.download = 'formatted-proof-of-payments.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Documents formatted and downloaded successfully');
    } catch (error) {
      console.error('Error formatting documents:', error);
      toast.error('Failed to format documents');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Proof of Payment Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="outline"
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Documents'}
          </Button>
          
          {uploadedFiles.length > 0 && (
            <Button
              onClick={formatAndCombineDocuments}
              variant="default"
            >
              <Download className="h-4 w-4 mr-2" />
              Format & Download
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Documents:</h4>
            {uploadedFiles.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm">{doc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(doc.uploadedAt).toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(doc)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>• Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
          <p>• Documents will be formatted to prevent text overlap</p>
          <p>• Combined into a single attachment for compliance emails</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProofOfPaymentUploader;