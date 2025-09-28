import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';

export interface Document {
  id: string;
  document_type: string;
  document_number: string;
  country: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  description?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useSession();

  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive",
        });
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    documentData: {
      document_type: string;
      document_number: string;
      country: string;
      issue_date: string;
      expiry_date: string;
      description?: string;
    }
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload documents",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentData.document_type}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload Failed",
          description: "Failed to upload document file",
          variant: "destructive",
        });
        return false;
      }

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          ...documentData,
          file_path: filePath,
          file_name: fileName,
          file_size: file.size,
          mime_type: file.type,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        toast({
          title: "Save Failed",
          description: "Failed to save document information",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Refresh documents list
      fetchDocuments();
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const downloadDocument = async (document: Document) => {
    if (!document.file_path) {
      toast({
        title: "Error",
        description: "Document file not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) {
        console.error('Download error:', error);
        toast({
          title: "Download Failed",
          description: "Failed to download document",
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name || `document_${document.document_number}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${document.document_type} downloaded successfully`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return false;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error('Delete error:', dbError);
        toast({
          title: "Delete Failed",
          description: "Failed to delete document",
          variant: "destructive",
        });
        return false;
      }

      // Delete file from storage if exists
      if (document.file_path) {
        await supabase.storage
          .from('documents')
          .remove([document.file_path]);
      }

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      // Refresh documents list
      fetchDocuments();
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  return {
    documents,
    loading,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
};