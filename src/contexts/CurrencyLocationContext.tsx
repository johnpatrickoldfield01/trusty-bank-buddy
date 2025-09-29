import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LocationCurrency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  exchangeRate: number; // Rate to convert from ZAR base
}

export const LOCATIONS: Record<string, LocationCurrency> = {
  'ZA': {
    code: 'ZAR',
    name: 'South Africa',
    symbol: 'R',
    locale: 'en-ZA',
    exchangeRate: 1 // Base currency
  },
  'GB': {
    code: 'GBP',
    name: 'United Kingdom', 
    symbol: '£',
    locale: 'en-GB',
    exchangeRate: 0.053 // ZAR to GBP
  },
  'US': {
    code: 'USD',
    name: 'United States',
    symbol: '$',
    locale: 'en-US', 
    exchangeRate: 0.055 // ZAR to USD
  },
  'DE': {
    code: 'EUR',
    name: 'Germany',
    symbol: '€',
    locale: 'de-DE',
    exchangeRate: 0.050 // ZAR to EUR
  },
  'JP': {
    code: 'JPY',
    name: 'Japan',
    symbol: '¥',
    locale: 'ja-JP',
    exchangeRate: 7.45 // ZAR to JPY
  },
  'AU': {
    code: 'AUD', 
    name: 'Australia',
    symbol: 'A$',
    locale: 'en-AU',
    exchangeRate: 0.082 // ZAR to AUD
  },
  'CA': {
    code: 'CAD',
    name: 'Canada',
    symbol: 'C$',
    locale: 'en-CA',
    exchangeRate: 0.074 // ZAR to CAD
  },
  'CH': {
    code: 'CHF',
    name: 'Switzerland',
    symbol: 'CHF',
    locale: 'de-CH',
    exchangeRate: 0.049 // ZAR to CHF
  }
};

interface CurrencyLocationContextType {
  selectedLocation: string;
  currentCurrency: LocationCurrency;
  locations: Record<string, LocationCurrency>;
  convertAmount: (amountInZAR: number) => number;
  formatCurrency: (amountInZAR: number, options?: Intl.NumberFormatOptions) => string;
  updateLocation: (locationCode: string) => void;
}

const CurrencyLocationContext = createContext<CurrencyLocationContextType | undefined>(undefined);

export const CurrencyLocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    // Load from localStorage or default to South Africa
    return localStorage.getItem('selectedLocation') || 'ZA';
  });

  const currentCurrency = LOCATIONS[selectedLocation];

  // Save to localStorage when location changes
  useEffect(() => {
    localStorage.setItem('selectedLocation', selectedLocation);
  }, [selectedLocation]);

  const convertAmount = (amountInZAR: number): number => {
    return amountInZAR * currentCurrency.exchangeRate;
  };

  const formatCurrency = (amountInZAR: number, options?: Intl.NumberFormatOptions): string => {
    const convertedAmount = convertAmount(amountInZAR);
    
    const formatOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    };

    // For JPY, don't show decimal places as it doesn't use them
    if (currentCurrency.code === 'JPY') {
      formatOptions.minimumFractionDigits = 0;
      formatOptions.maximumFractionDigits = 0;
    }

    const formatted = convertedAmount.toLocaleString(currentCurrency.locale, formatOptions);
    
    // Add symbol prefix for most currencies, suffix for some
    if (currentCurrency.code === 'EUR') {
      return `${formatted} ${currentCurrency.symbol}`;
    } else {
      return `${currentCurrency.symbol}${formatted}`;
    }
  };

  const updateLocation = (locationCode: string) => {
    if (LOCATIONS[locationCode]) {
      setSelectedLocation(locationCode);
    }
  };

  const value: CurrencyLocationContextType = {
    selectedLocation,
    currentCurrency,
    locations: LOCATIONS,
    convertAmount,
    formatCurrency,
    updateLocation
  };

  return (
    <CurrencyLocationContext.Provider value={value}>
      {children}
    </CurrencyLocationContext.Provider>
  );
};

export const useCurrencyLocation = (): CurrencyLocationContextType => {
  const context = useContext(CurrencyLocationContext);
  if (!context) {
    throw new Error('useCurrencyLocation must be used within a CurrencyLocationProvider');
  }
  return context;
};