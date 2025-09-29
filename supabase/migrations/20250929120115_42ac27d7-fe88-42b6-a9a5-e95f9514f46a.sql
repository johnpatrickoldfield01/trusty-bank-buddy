-- Create storage bucket for proof of payment documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proof-of-payments', 'proof-of-payments', false);

-- Create policies for proof of payment documents
CREATE POLICY "Users can upload their own proof of payments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'proof-of-payments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own proof of payments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proof-of-payments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own proof of payments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'proof-of-payments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own proof of payments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'proof-of-payments' AND auth.uid()::text = (storage.foldername(name))[1]);