
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useUserRole } from '@/hooks/useUserRole';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCapacitor } from '@/hooks/useCapacitor';
import { cn } from '@/lib/utils';

export type Profile = {
  id: string;
  full_name: string;
};

const AppLayout = () => {
  const { session, loading, user } = useSession();
  const { isGuest, userRole } = useUserRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const isMobile = useIsMobile();
  const { isNative } = useCapacitor();

  useEffect(() => {
    if (!loading && !session && !isGuest) {
      navigate('/auth');
    }
  }, [session, loading, navigate, isGuest]);

  useEffect(() => {
    if (isGuest) {
      setProfile({ id: 'guest', full_name: 'Guest User' });
      setProfileLoading(false);
      return;
    }

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
  }, [session, user, isGuest]);

  if ((loading || profileLoading) && !isGuest) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-2xl font-medium">Loading...</div>
        </div>
    );
  }

  // Require profile for non-guest users
  if (!isGuest && (!session || !profile)) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-2xl font-medium">Loading...</div>
        </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      isNative && "safe-area-inset-top"
    )}>
      <Header />
      <main className={cn(
        "flex-1",
        (isMobile || isNative) && "pb-20" // Add bottom padding for mobile nav
      )}>
        <Outlet context={{ profile, isGuest, userRole }} />
      </main>
      {!isNative && <Footer />}
      {(isMobile || isNative) && <MobileBottomNav />}
    </div>
  );
};

export default AppLayout;
