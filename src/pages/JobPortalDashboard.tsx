import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Briefcase, Search, MapPin, Clock, GraduationCap, Building2, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DualSalaryDialog } from '@/components/jobs/DualSalaryDialog';
import { useSession } from '@/hooks/useSession';
import { useQuery } from '@tanstack/react-query';
import { TestEmailButton } from '@/components/jobs/TestEmailButton';

interface JobCategory {
  id: string;
  name: string;
  description: string;
}

interface JobListing {
  id: string;
  title: string;
  category_id: string;
  description: string;
  requirements: string;
  expected_salary_min: number;
  expected_salary_max: number;
  currency: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  location: string;
  remote_available: boolean;
  created_at: string;
}

interface JobWithCategory extends JobListing {
  job_categories?: JobCategory;
}

const currencyOptions = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

const exchangeRates: { [key: string]: number } = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  CAD: 1.25,
  AUD: 1.35,
  ZAR: 18.5,
  JPY: 110,
  CHF: 0.92,
};

const JobPortalDashboard = () => {
  const [jobs, setJobs] = useState<JobWithCategory[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState('ZAR');
  const [experienceLevel, setExperienceLevel] = useState<string>('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [salarySetups, setSalarySetups] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { user } = useSession();

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch salary setups for current user
  const { data: userSalarySetups } = useQuery({
    queryKey: ['salary-setups', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('job_salary_setups')
        .select('job_id, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Update salary setups state when data changes
  useEffect(() => {
    if (userSalarySetups) {
      const setupsMap = userSalarySetups.reduce((acc, setup) => {
        acc[setup.job_id] = setup.is_active;
        return acc;
      }, {} as Record<string, boolean>);
      setSalarySetups(setupsMap);
    }
  }, [userSalarySetups]);

  const fetchData = async () => {
    try {
      const [jobsRes, categoriesRes] = await Promise.all([
        supabase
          .from('job_listings')
          .select(`
            *,
            job_categories (
              id,
              name,
              description
            )
          `)
          .order('created_at', { ascending: false }),
        supabase.from('job_categories').select('*').order('name')
      ]);

      if (jobsRes.data) setJobs(jobsRes.data as JobWithCategory[]);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching job data:', error);
      toast({
        title: "Error",
        description: "Failed to load job listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const convertSalary = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    const usdAmount = amount / exchangeRates[fromCurrency];
    return usdAmount * exchangeRates[toCurrency];
  };

  const formatSalary = (amount: number, currency: string) => {
    const currencyInfo = currencyOptions.find(c => c.code === currency);
    const symbol = currencyInfo?.symbol || currency;
    
    if (currency === 'JPY') {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  };

  const getRegionFromLocation = (location: string): string => {
    const locationLower = location.toLowerCase();
    
    // EMEA (Europe, Middle East, Africa)
    if (locationLower.includes('europe') || locationLower.includes('uk') || locationLower.includes('london') || 
        locationLower.includes('paris') || locationLower.includes('berlin') || locationLower.includes('madrid') ||
        locationLower.includes('africa') || locationLower.includes('dubai') || locationLower.includes('middle east') ||
        locationLower.includes('south africa') || locationLower.includes('egypt') || locationLower.includes('israel')) {
      return 'EMEA';
    }
    
    // North America
    if (locationLower.includes('usa') || locationLower.includes('united states') || locationLower.includes('canada') ||
        locationLower.includes('new york') || locationLower.includes('san francisco') || locationLower.includes('toronto') ||
        locationLower.includes('north america') || locationLower.includes('chicago') || locationLower.includes('boston')) {
      return 'NA';
    }
    
    // LATAM (Latin America)
    if (locationLower.includes('latin america') || locationLower.includes('brazil') || locationLower.includes('mexico') ||
        locationLower.includes('argentina') || locationLower.includes('chile') || locationLower.includes('colombia') ||
        locationLower.includes('peru') || locationLower.includes('venezuela')) {
      return 'LATAM';
    }
    
    // APAC (Asia-Pacific)
    if (locationLower.includes('asia') || locationLower.includes('pacific') || locationLower.includes('china') ||
        locationLower.includes('japan') || locationLower.includes('singapore') || locationLower.includes('australia') ||
        locationLower.includes('india') || locationLower.includes('hong kong') || locationLower.includes('tokyo') ||
        locationLower.includes('sydney') || locationLower.includes('mumbai') || locationLower.includes('beijing')) {
      return 'APAC';
    }
    
    return 'Other';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || job.category_id === selectedCategory;
    const matchesExperience = experienceLevel === 'all' || job.experience_level === experienceLevel;
    const matchesRemote = !remoteOnly || job.remote_available;
    const matchesRegion = selectedRegion === 'all' || getRegionFromLocation(job.location) === selectedRegion;

    return matchesSearch && matchesCategory && matchesExperience && matchesRemote && matchesRegion;
  });

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'executive': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading Job Portal...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Commerce Graduate Job Portal</h1>
          <p className="text-muted-foreground">100+ graduate opportunities with salary insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{jobs.length}</p>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{jobs.filter(j => j.remote_available).length}</p>
                <p className="text-sm text-muted-foreground">Remote Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatSalary(
                    convertSalary(
                      jobs.reduce((sum, job) => sum + job.expected_salary_max, 0) / jobs.length,
                      'USD',
                      selectedCurrency
                    ),
                    selectedCurrency
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Max Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="insights">Salary Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Search Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="EMEA">EMEA</SelectItem>
                      <SelectItem value="NA">North America</SelectItem>
                      <SelectItem value="LATAM">LATAM</SelectItem>
                      <SelectItem value="APAC">APAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button
                    variant={remoteOnly ? "default" : "outline"}
                    onClick={() => setRemoteOnly(!remoteOnly)}
                    className="w-full"
                  >
                    Remote Only
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Job Listings ({filteredJobs.length} results)</span>
                <TestEmailButton />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.job_categories?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                            {job.remote_available && " (Remote Available)"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getExperienceLevelColor(job.experience_level)}>
                          {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {formatSalary(convertSalary(job.expected_salary_min, job.currency, selectedCurrency), selectedCurrency)} - {formatSalary(convertSalary(job.expected_salary_max, job.currency, selectedCurrency), selectedCurrency)}
                          </p>
                          <p className="text-xs text-muted-foreground">per year</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Commerce Graduate</span>
                        {job.remote_available && (
                          <Badge variant="outline" className="text-xs">
                            Remote Available
                          </Badge>
                        )}
                        {salarySetups[job.id] && (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                            ✓ Monthly Salary Active
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <TestEmailButton 
                          jobTitle={job.title}
                          jobDescription={job.description}
                          salaryMin={convertSalary(job.expected_salary_min, job.currency, selectedCurrency)}
                          salaryMax={convertSalary(job.expected_salary_max, job.currency, selectedCurrency)}
                          currency={selectedCurrency}
                          location={job.location}
                          bankName="FNB"
                        />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{job.title}</DialogTitle>
                            <DialogDescription>
                              {job.job_categories?.name} • {job.location}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Job Description</h4>
                              <p className="text-sm text-muted-foreground">{job.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Requirements</h4>
                              <p className="text-sm text-muted-foreground">{job.requirements}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Salary Range</h4>
                                <p className="text-lg font-mono">
                                  {formatSalary(convertSalary(job.expected_salary_min, job.currency, selectedCurrency), selectedCurrency)} - {formatSalary(convertSalary(job.expected_salary_max, job.currency, selectedCurrency), selectedCurrency)}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Experience Level</h4>
                                <Badge className={getExperienceLevelColor(job.experience_level)}>
                                  {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                                </Badge>
                              </div>
                             </div>
                             
                             {salarySetups[job.id] && (
                               <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                 <div className="flex items-center gap-2">
                                   <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                     ✓ Monthly Salary Active
                                   </Badge>
                                 </div>
                                 <p className="text-sm text-green-700 mt-1">
                                   Automatic monthly payments are set up for this position. Salary slips are emailed monthly to oldfieldjohnpatrick@gmail.com.
                                 </p>
                               </div>
                             )}
                           </div>
                         </DialogContent>
                        </Dialog>
                        
                        <DualSalaryDialog
                          job={job}
                          selectedCurrency={selectedCurrency}
                          convertSalary={convertSalary}
                          formatSalary={formatSalary}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Categories</CardTitle>
              <CardDescription>Explore different career paths for commerce graduates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const categoryJobs = jobs.filter(job => job.category_id === category.id);
                  const avgSalary = categoryJobs.length > 0 
                    ? categoryJobs.reduce((sum, job) => sum + job.expected_salary_max, 0) / categoryJobs.length
                    : 0;
                  
                  return (
                    <Card key={category.id} className="p-4">
                      <h3 className="font-semibold mb-2">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span>{categoryJobs.length} jobs</span>
                        <span className="font-mono">
                          Avg: {formatSalary(convertSalary(avgSalary, 'USD', selectedCurrency), selectedCurrency)}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Insights by Experience Level</CardTitle>
              <CardDescription>Average salary ranges for commerce graduates in {selectedCurrency}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Experience Level</TableHead>
                    <TableHead>Job Count</TableHead>
                    <TableHead>Average Min Salary</TableHead>
                    <TableHead>Average Max Salary</TableHead>
                    <TableHead>Salary Range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['entry', 'mid', 'senior', 'executive'].map((level) => {
                    const levelJobs = jobs.filter(job => job.experience_level === level);
                    const avgMin = levelJobs.length > 0 
                      ? levelJobs.reduce((sum, job) => sum + job.expected_salary_min, 0) / levelJobs.length
                      : 0;
                    const avgMax = levelJobs.length > 0 
                      ? levelJobs.reduce((sum, job) => sum + job.expected_salary_max, 0) / levelJobs.length
                      : 0;
                    
                    return (
                      <TableRow key={level}>
                        <TableCell>
                          <Badge className={getExperienceLevelColor(level)}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{levelJobs.length}</TableCell>
                        <TableCell className="font-mono">
                          {formatSalary(convertSalary(avgMin, 'USD', selectedCurrency), selectedCurrency)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatSalary(convertSalary(avgMax, 'USD', selectedCurrency), selectedCurrency)}
                        </TableCell>
                        <TableCell className="font-mono text-green-600">
                          {avgMax > 0 ? formatSalary(convertSalary(avgMax - avgMin, 'USD', selectedCurrency), selectedCurrency) : 'N/A'}
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

export default JobPortalDashboard;