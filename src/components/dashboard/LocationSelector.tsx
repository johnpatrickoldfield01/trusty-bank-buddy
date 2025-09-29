import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useCurrencyLocation, LOCATIONS } from '@/hooks/useCurrencyLocation';

const LocationSelector: React.FC = () => {
  const { selectedLocation, currentCurrency, updateLocation } = useCurrencyLocation();

  const getFlagEmoji = (countryCode: string): string => {
    const flags: Record<string, string> = {
      'ZA': '🇿🇦',
      'GB': '🇬🇧', 
      'US': '🇺🇸',
      'DE': '🇩🇪',
      'JP': '🇯🇵',
      'AU': '🇦🇺',
      'CA': '🇨🇦',
      'CH': '🇨🇭'
    };
    return flags[countryCode] || '🌍';
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedLocation} onValueChange={updateLocation}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{getFlagEmoji(selectedLocation)}</span>
              <span className="font-medium">{currentCurrency.name}</span>
              <span className="text-muted-foreground">({currentCurrency.code})</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LOCATIONS).map(([code, location]) => (
            <SelectItem key={code} value={code}>
              <div className="flex items-center gap-2">
                <span>{getFlagEmoji(code)}</span>
                <span>{location.name}</span>
                <span className="text-muted-foreground">({location.code})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationSelector;