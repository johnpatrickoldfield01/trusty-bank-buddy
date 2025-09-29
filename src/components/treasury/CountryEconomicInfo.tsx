import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Building, DollarSign, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
}

interface CountryEconomicInfoProps {
  country: Country;
  onBack: () => void;
}

const economicData: Record<string, any> = {
  GB: {
    gdp: '$3.13 trillion',
    gdpPerCapita: '$46,344',
    gdpGrowth: '1.3%',
    inflation: '2.1%',
    unemployment: '3.7%',
    corporateTax: '25%',
    vatRate: '20%',
    description: 'The United Kingdom has a highly developed mixed economy and is the fifth-largest economy in the world by nominal GDP. It is a major financial center with London being one of the world\'s leading financial hubs.',
    sectors: ['Financial Services', 'Manufacturing', 'Services', 'Technology']
  },
  DE: {
    gdp: '$4.26 trillion',
    gdpPerCapita: '$51,203',
    gdpGrowth: '0.2%',
    inflation: '3.1%',
    unemployment: '3.1%',
    corporateTax: '30%',
    vatRate: '19%',
    description: 'Germany has the largest economy in Europe and is globally known for its automotive, engineering, and chemical industries. It is a major exporter and industrial powerhouse.',
    sectors: ['Automotive', 'Engineering', 'Chemicals', 'Technology']
  },
  US: {
    gdp: '$26.95 trillion',
    gdpPerCapita: '$80,412',
    gdpGrowth: '2.1%',
    inflation: '3.2%',
    unemployment: '3.6%',
    corporateTax: '21%',
    vatRate: 'N/A (Sales Tax varies by state)',
    description: 'The United States has the world\'s largest economy by nominal GDP, driven by a diverse mix of services, technology, finance, and manufacturing sectors.',
    sectors: ['Technology', 'Financial Services', 'Healthcare', 'Manufacturing']
  },
  ZA: {
    gdp: '$419.02 billion',
    gdpPerCapita: '$6,994',
    gdpGrowth: '0.6%',
    inflation: '5.1%',
    unemployment: '32.9%',
    corporateTax: '27%',
    vatRate: '15%',
    description: 'South Africa is the most industrialized economy in Africa, with significant mining, manufacturing, and services sectors. It is rich in natural resources including gold, diamonds, and platinum.',
    sectors: ['Mining', 'Manufacturing', 'Agriculture', 'Financial Services']
  },
  JP: {
    gdp: '$4.24 trillion',
    gdpPerCapita: '$33,950',
    gdpGrowth: '1.2%',
    inflation: '2.8%',
    unemployment: '2.6%',
    corporateTax: '23.2%',
    vatRate: '10%',
    description: 'Japan is the world\'s third-largest economy, known for its advanced technology, automotive, and electronics industries. It has a highly developed financial system.',
    sectors: ['Technology', 'Automotive', 'Electronics', 'Manufacturing']
  }
};

const CountryEconomicInfo: React.FC<CountryEconomicInfoProps> = ({ country, onBack }) => {
  const data = economicData[country.code] || {
    gdp: 'Data not available',
    gdpPerCapita: 'Data not available',
    gdpGrowth: 'Data not available',
    inflation: 'Data not available',
    unemployment: 'Data not available',
    corporateTax: 'Data not available',
    vatRate: 'Data not available',
    description: 'Economic data for this country is currently being updated.',
    sectors: ['Mixed Economy']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Countries
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{country.flag}</span>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">{country.name}</h1>
              <p className="text-slate-600">Economic Overview & GDP Analysis</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GDP (Nominal)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.gdp}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GDP Per Capita</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.gdpPerCapita}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GDP Growth</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.gdpGrowth}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Economic Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Inflation Rate:</span>
                <Badge variant="outline">{data.inflation}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Unemployment:</span>
                <Badge variant="outline">{data.unemployment}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Corporate Tax:</span>
                <Badge variant="outline">{data.corporateTax}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">VAT/Sales Tax:</span>
                <Badge variant="outline">{data.vatRate}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Currency:</span>
                <Badge>{country.currency}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Economic Sectors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {data.sectors.map((sector: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {sector}
                  </Badge>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Economic Overview</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CountryEconomicInfo;