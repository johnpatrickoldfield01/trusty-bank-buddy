import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Vault } from 'lucide-react';
import CountryTreasuryDashboard from './CountryTreasuryDashboard';
import CountryEconomicInfo from './CountryEconomicInfo';

interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
}

const countriesByRegion: Record<string, Country[]> = {
  emea: [
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
    { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF' }
  ],
  na: [
    { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN' }
  ],
  latam: [
    { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP' },
    { code: 'PE', name: 'Peru', flag: '🇵🇪', currency: 'PEN' }
  ],
  apac: [
    { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
    { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD' },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD' },
    { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR' }
  ]
};

interface CountrySelectionProps {
  region: string;
  onBack: () => void;
}

const CountrySelection: React.FC<CountrySelectionProps> = ({ region, onBack }) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'treasury' | 'economic' | null>(null);

  const countries = countriesByRegion[region] || [];
  const regionName = {
    emea: 'EMEA',
    na: 'North America',
    latam: 'LATAM',
    apac: 'APAC'
  }[region] || region.toUpperCase();

  if (selectedCountry && viewMode === 'treasury') {
    const country = countries.find(c => c.code === selectedCountry);
    return (
      <CountryTreasuryDashboard 
        country={country!} 
        onBack={() => {
          setSelectedCountry(null);
          setViewMode(null);
        }} 
      />
    );
  }

  if (selectedCountry && viewMode === 'economic') {
    const country = countries.find(c => c.code === selectedCountry);
    return (
      <CountryEconomicInfo 
        country={country!} 
        onBack={() => {
          setSelectedCountry(null);
          setViewMode(null);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Regions
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{regionName} Treasury</h1>
            <p className="text-slate-600">Select a country to manage treasury operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country) => (
            <Card key={country.code} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-2">{country.flag}</div>
                <CardTitle className="text-xl font-bold">{country.name}</CardTitle>
                <p className="text-sm text-slate-600">Currency: {country.currency}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    setSelectedCountry(country.code);
                    setViewMode('economic');
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                  Economic Info
                </Button>
                <Button 
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    setSelectedCountry(country.code);
                    setViewMode('treasury');
                  }}
                >
                  <Vault className="h-4 w-4" />
                  Treasury Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountrySelection;