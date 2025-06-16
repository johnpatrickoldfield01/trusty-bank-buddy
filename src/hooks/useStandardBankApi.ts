
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SelfRegistrationData {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  businessType: string;
  intendedUse: string;
}

interface ApiCallData {
  endpoint: string;
  method: string;
  data?: any;
  accessToken?: string;
}

export const useStandardBankApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const selfRegister = async (registrationData: SelfRegistrationData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('standard-bank-integration', {
        body: {
          action: 'self-register',
          ...registrationData,
        },
      });

      if (error) {
        console.error('Registration error:', error);
        toast.error('Registration failed. Please try again.');
        setRegistrationStatus('error');
        return { success: false, error };
      }

      if (data.success) {
        toast.success('Registration successful! Check your email for next steps.');
        setRegistrationStatus('success');
        return { success: true, data: data.data };
      } else {
        toast.error(data.error || 'Registration failed');
        setRegistrationStatus('error');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      setRegistrationStatus('error');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const makeApiCall = async (apiCallData: ApiCallData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('standard-bank-integration', {
        body: {
          action: 'api-call',
          ...apiCallData,
        },
      });

      if (error) {
        console.error('API call error:', error);
        toast.error('API call failed');
        return { success: false, error };
      }

      return { success: data.success, data: data.data, status: data.status };
    } catch (error) {
      console.error('Unexpected API error:', error);
      toast.error('API call failed');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountInfo = async (accessToken: string) => {
    return await makeApiCall({
      endpoint: '/sbsa/ext-prod/accounts',
      method: 'GET',
      accessToken,
    });
  };

  const getTransactions = async (accessToken: string, accountId: string) => {
    return await makeApiCall({
      endpoint: `/sbsa/ext-prod/accounts/${accountId}/transactions`,
      method: 'GET',
      accessToken,
    });
  };

  return {
    selfRegister,
    makeApiCall,
    getAccountInfo,
    getTransactions,
    isLoading,
    registrationStatus,
  };
};
