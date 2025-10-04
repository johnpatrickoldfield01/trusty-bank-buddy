import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Map, Building, TrendingUp, Download } from 'lucide-react';
import CountrySelection from './CountrySelection';
import { useTreasuryReservesDownloader } from '@/hooks/useTreasuryReservesDownloader';

interface Region {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: React.ReactNode;
}

const regions: Region[] = [
  {
    id: 'emea',
    name: 'EMEA',
    code: 'emea',
    description: 'Europe, the Middle East and Africa',
    icon: <Globe className="h-8 w-8" />
  },
  {
    id: 'na',
    name: 'North America',
    code: 'na', 
    description: 'United States, Canada, Mexico',
    icon: <Map className="h-8 w-8" />
  },
  {
    id: 'latam',
    name: 'LATAM',
    code: 'latam',
    description: 'Latin America',
    icon: <Building className="h-8 w-8" />
  },
  {
    id: 'apac',
    name: 'APAC',
    code: 'apac',
    description: 'Asia-Pacific',
    icon: <TrendingUp className="h-8 w-8" />
  }
];

const RegionalTreasuryDashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const { downloadTreasuryReserves } = useTreasuryReservesDownloader();

  if (selectedRegion) {
    return (
      <CountrySelection 
        region={selectedRegion} 
        onBack={() => setSelectedRegion(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Global Treasury Management</h1>
            <p className="text-slate-600">Select a region to manage treasury operations</p>
          </div>
          <Button 
            onClick={downloadTreasuryReserves}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Treasury Reserves
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regions.map((region) => (
            <Card 
              key={region.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
              onClick={() => setSelectedRegion(region.code)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4 text-primary">
                  {region.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  {region.name}
                </CardTitle>
                <p className="text-slate-600 mt-2">{region.description}</p>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRegion(region.code);
                  }}
                >
                  Access {region.name} Treasury
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionalTreasuryDashboard;