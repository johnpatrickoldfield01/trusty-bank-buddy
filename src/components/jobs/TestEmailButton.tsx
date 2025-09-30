import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const TestEmailButton: React.FC = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendTestEmail = async () => {
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-salary-email', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent! 📧",
        description: "Check oldfieldjohnpatrick@gmail.com for the test salary notification",
        variant: "default"
      });

      console.log('Test email response:', data);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Email Failed",
        description: "Failed to send test email. Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button 
      onClick={sendTestEmail} 
      disabled={isSending}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isSending ? (
        <>
          <Send className="h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          Send Test Email
        </>
      )}
    </Button>
  );
};