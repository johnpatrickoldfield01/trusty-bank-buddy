
import { Home, CreditCard, Send, Coins, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCapacitor } from '@/hooks/useCapacitor';
import { ImpactStyle } from '@capacitor/haptics';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerHaptic } = useCapacitor();

  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: CreditCard, label: 'Cards', path: '/cards' },
    { icon: Send, label: 'Send', path: '/payments' },
    { icon: Coins, label: 'Crypto', path: '/crypto' },
  ];

  const handleTabPress = async (path: string) => {
    await triggerHaptic(ImpactStyle.Light);
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || 
            (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <button
              key={path}
              onClick={() => handleTabPress(path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors rounded-lg mx-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
