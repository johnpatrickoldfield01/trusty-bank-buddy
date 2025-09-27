import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Globe, FileText, Upload, Building, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StockExchange {
  id: string;
  name: string;
  country: string;
  region: string;
  currency: string;
  trading_hours: string;
  website: string;
  market_cap_requirement: number;
}

interface ListingRequirement {
  id: string;
  exchange_id: string;
  requirement_type: string;
  description: string;
  mandatory: boolean;
  documents_required: string[];
}

interface ListingApplication {
  id: string;
  company_name: string;
  exchange_id: string;
  applicant_email: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  documents_uploaded: { [key: string]: boolean };
  application_data: { [key: string]: any };
  created_at: string;
  submitted_at?: string;
}

interface ExchangeWithRequirements extends StockExchange {
  listing_requirements?: ListingRequirement[];
}

const StockExchangeDashboard = () => {
  const [exchanges, setExchanges] = useState<ExchangeWithRequirements[]>([]);
  const [applications, setApplications] = useState<ListingApplication[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [applicationForm, setApplicationForm] = useState({
    company_name: '',
    exchange_id: '',
    applicant_email: '',
    business_description: '',
    market_cap: '',
    annual_revenue: '',
    years_in_operation: '',
    number_of_employees: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [exchangesRes, applicationsRes] = await Promise.all([
        supabase
          .from('stock_exchanges')
          .select(`
            *,
            listing_requirements (*)
          `)
          .order('name'),
        supabase
          .from('listing_applications')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (exchangesRes.data) setExchanges(exchangesRes.data);
      if (applicationsRes.data) setApplications(applicationsRes.data as ListingApplication[]);
    } catch (error) {
      console.error('Error fetching stock exchange data:', error);
      toast({
        title: "Error",
        description: "Failed to load stock exchange data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    try {
      const { error } = await supabase.from('listing_applications').insert([
        {
          company_name: applicationForm.company_name,
          exchange_id: applicationForm.exchange_id,
          applicant_email: applicationForm.applicant_email,
          application_data: {
            business_description: applicationForm.business_description,
            market_cap: parseFloat(applicationForm.market_cap),
            annual_revenue: parseFloat(applicationForm.annual_revenue),
            years_in_operation: parseInt(applicationForm.years_in_operation),
            number_of_employees: parseInt(applicationForm.number_of_employees)
          },
          documents_uploaded: {}
        }
      ]);

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your listing application has been submitted for review",
      });

      setApplicationForm({
        company_name: '',
        exchange_id: '',
        applicant_email: '',
        business_description: '',
        market_cap: '',
        annual_revenue: '',
        years_in_operation: '',
        number_of_employees: ''
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'under_review': 
      case 'submitted': return Clock;
      case 'rejected': return AlertTriangle;
      default: return FileText;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'JPY' ? 'JPY' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  const regions = [...new Set(exchanges.map(e => e.region))];
  const filteredExchanges = selectedRegion === 'all' 
    ? exchanges 
    : exchanges.filter(e => e.region === selectedRegion);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading Stock Exchange Dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Stock Exchange Listing Dashboard</h1>
          <p className="text-muted-foreground">Explore global exchanges and manage listing applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{exchanges.length}</p>
                <p className="text-sm text-muted-foreground">Global Exchanges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{regions.length}</p>
                <p className="text-sm text-muted-foreground">Regions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{applications.filter(a => a.status === 'approved').length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exchanges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="exchanges">Stock Exchanges</TabsTrigger>
          <TabsTrigger value="requirements">Listing Requirements</TabsTrigger>
          <TabsTrigger value="apply">Apply for Listing</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="exchanges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Stock Exchanges</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-4">
                  <span>Filter by region:</span>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExchanges.map((exchange) => (
                  <Card key={exchange.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{exchange.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          <span>{exchange.country}</span>
                          <Badge variant="outline">{exchange.region}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Currency:</span>
                          <span className="font-mono">{exchange.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trading Hours:</span>
                          <span className="text-xs">{exchange.trading_hours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Market Cap:</span>
                          <span className="font-mono text-green-600">
                            {formatCurrency(exchange.market_cap_requirement || 0, exchange.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(exchange.website, '_blank')}
                        >
                          Visit Website
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setSelectedExchange(exchange.id)}
                        >
                          View Requirements
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listing Requirements</CardTitle>
              <CardDescription>
                <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select an exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    {exchanges.map((exchange) => (
                      <SelectItem key={exchange.id} value={exchange.id}>
                        {exchange.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedExchange && (
                <div className="space-y-4">
                  {(() => {
                    const exchange = exchanges.find(e => e.id === selectedExchange);
                    const requirements = exchange?.listing_requirements || [];
                    
                    return (
                      <div>
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                          <h3 className="font-semibold text-lg">{exchange?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Minimum Market Cap: {formatCurrency(exchange?.market_cap_requirement || 0, exchange?.currency || 'USD')}
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          {requirements.map((req) => (
                            <Card key={req.id} className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{req.requirement_type} Requirements</h4>
                                <Badge variant={req.mandatory ? "default" : "secondary"}>
                                  {req.mandatory ? "Mandatory" : "Optional"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{req.description}</p>
                              
                              <div>
                                <h5 className="font-medium text-sm mb-2">Required Documents:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {req.documents_required.map((doc, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {doc}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apply" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Listing Application</CardTitle>
              <CardDescription>Apply to list your company on a stock exchange</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    value={applicationForm.company_name}
                    onChange={(e) => setApplicationForm({...applicationForm, company_name: e.target.value})}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="applicant_email">Contact Email</Label>
                  <Input
                    type="email"
                    value={applicationForm.applicant_email}
                    onChange={(e) => setApplicationForm({...applicationForm, applicant_email: e.target.value})}
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="exchange_id">Target Exchange</Label>
                <Select value={applicationForm.exchange_id} onValueChange={(value) => setApplicationForm({...applicationForm, exchange_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stock exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    {exchanges.map((exchange) => (
                      <SelectItem key={exchange.id} value={exchange.id}>
                        {exchange.name} ({exchange.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="business_description">Business Description</Label>
                <Textarea
                  value={applicationForm.business_description}
                  onChange={(e) => setApplicationForm({...applicationForm, business_description: e.target.value})}
                  placeholder="Describe your business operations, industry, and competitive advantages..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="market_cap">Market Capitalization</Label>
                  <Input
                    type="number"
                    value={applicationForm.market_cap}
                    onChange={(e) => setApplicationForm({...applicationForm, market_cap: e.target.value})}
                    placeholder="Market cap in USD"
                  />
                </div>
                <div>
                  <Label htmlFor="annual_revenue">Annual Revenue</Label>
                  <Input
                    type="number"
                    value={applicationForm.annual_revenue}
                    onChange={(e) => setApplicationForm({...applicationForm, annual_revenue: e.target.value})}
                    placeholder="Annual revenue in USD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years_in_operation">Years in Operation</Label>
                  <Input
                    type="number"
                    value={applicationForm.years_in_operation}
                    onChange={(e) => setApplicationForm({...applicationForm, years_in_operation: e.target.value})}
                    placeholder="Number of years"
                  />
                </div>
                <div>
                  <Label htmlFor="number_of_employees">Number of Employees</Label>
                  <Input
                    type="number"
                    value={applicationForm.number_of_employees}
                    onChange={(e) => setApplicationForm({...applicationForm, number_of_employees: e.target.value})}
                    placeholder="Employee count"
                  />
                </div>
              </div>

              <Button onClick={handleSubmitApplication} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listing Applications</CardTitle>
              <CardDescription>Track the status of your listing applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => {
                    const exchange = exchanges.find(e => e.id === application.exchange_id);
                    const StatusIcon = getStatusIcon(application.status);
                    
                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.company_name}</p>
                            <p className="text-sm text-muted-foreground">{application.applicant_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{exchange?.name}</p>
                            <p className="text-sm text-muted-foreground">{exchange?.country}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {application.submitted_at 
                            ? new Date(application.submitted_at).toLocaleDateString()
                            : new Date(application.created_at).toLocaleDateString()
                          }
                        </TableCell>
                        <TableCell className="font-mono">
                          {application.application_data?.market_cap 
                            ? formatCurrency(application.application_data.market_cap, 'USD')
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{application.company_name}</DialogTitle>
                                <DialogDescription>
                                  Application to {exchange?.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-1">Status</h4>
                                    <Badge className={getStatusColor(application.status)}>
                                      {application.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-1">Market Cap</h4>
                                    <p className="font-mono">
                                      {formatCurrency(application.application_data?.market_cap || 0, 'USD')}
                                    </p>
                                  </div>
                                </div>
                                {application.application_data?.business_description && (
                                  <div>
                                    <h4 className="font-semibold mb-1">Business Description</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {application.application_data.business_description}
                                    </p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Annual Revenue:</span>
                                    <p className="font-mono">
                                      {formatCurrency(application.application_data?.annual_revenue || 0, 'USD')}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Years in Operation:</span>
                                    <p>{application.application_data?.years_in_operation || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockExchangeDashboard;