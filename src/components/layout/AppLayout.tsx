
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Profile = {
  id: string;
  full_name: string;
};

const AppLayout = () => {
  const { session, loading, user } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/auth');
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    if (session && user) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
          toast.error('Failed to fetch profile');
          console.error(error);
        } else if (data) {
          setProfile(data);
        } else {
            // Profile doesn't exist, create it.
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({ id: user.id, full_name: user.user_metadata.full_name || 'New User' })
              .select()
              .single();

            if (insertError) {
                toast.error('Failed to create profile');
                console.error(insertError);
            } else {
                setProfile(newProfile);
            }
        }
        setProfileLoading(false);
      };
      fetchProfile();
    }
  }, [session, user]);

  if (loading || profileLoading || !session || !profile) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-2xl font-medium">Loading...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet context={{ profile }} />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
