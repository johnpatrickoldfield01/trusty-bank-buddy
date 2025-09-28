import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Target, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

const initialCategories: BudgetCategory[] = [
  { id: '1', name: 'Housing', budgeted: 8000, spent: 7500, color: '#8884d8' },
  { id: '2', name: 'Food & Dining', budgeted: 3000, spent: 2800, color: '#82ca9d' },
  { id: '3', name: 'Transportation', budgeted: 2000, spent: 1850, color: '#ffc658' },
  { id: '4', name: 'Entertainment', budgeted: 1500, spent: 1200, color: '#ff7300' },
  { id: '5', name: 'Utilities', budgeted: 1200, spent: 1100, color: '#8dd1e1' },
  { id: '6', name: 'Healthcare', budgeted: 800, spent: 650, color: '#d084d0' },
  { id: '7', name: 'Shopping', budgeted: 2500, spent: 2200, color: '#ffb347' },
  { id: '8', name: 'Savings', budgeted: 5000, spent: 5000, color: '#87ceeb' }
];

const mockTransactions: Transaction[] = [
  { id: '1', description: 'Salary Deposit', amount: 25000, category: 'Income', date: '2024-01-01', type: 'income' },
  { id: '2', description: 'Rent Payment', amount: -7500, category: 'Housing', date: '2024-01-01', type: 'expense' },
  { id: '3', description: 'Grocery Store', amount: -850, category: 'Food & Dining', date: '2024-01-02', type: 'expense' },
  { id: '4', description: 'Fuel', amount: -600, category: 'Transportation', date: '2024-01-03', type: 'expense' },
  { id: '5', description: 'Movie Tickets', amount: -300, category: 'Entertainment', date: '2024-01-05', type: 'expense' }
];

const BudgetingPage = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>(initialCategories);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [newCategory, setNewCategory] = useState({ name: '', budgeted: 0 });
  const { toast } = useToast();

  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = totalBudgeted - totalSpent;

  const addCategory = () => {
    if (newCategory.name && newCategory.budgeted > 0) {
      const category: BudgetCategory = {
        id: Date.now().toString(),
        name: newCategory.name,
        budgeted: newCategory.budgeted,
        spent: 0,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', budgeted: 0 });
      toast({
        title: "Category Added",
        description: `${newCategory.name} budget category created successfully.`,
      });
    }
  };

  const updateCategoryBudget = (id: string, newBudget: number) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, budgeted: newBudget } : cat
    ));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const monthlyData = [
    { month: 'Jan', income: 25000, expenses: 21300, savings: 3700 },
    { month: 'Feb', income: 25000, expenses: 22100, savings: 2900 },
    { month: 'Mar', income: 25000, expenses: 20800, savings: 4200 },
    { month: 'Apr', income: 25000, expenses: 21500, savings: 3500 },
    { month: 'May', income: 25000, expenses: 21300, savings: 3700 },
    { month: 'Jun', income: 25000, expenses: 22000, savings: 3000 }
  ];

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <p className="text-muted-foreground">
          Track your income, expenses, and savings goals with comprehensive budgeting tools
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R {totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R {totalBudgeted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Planned spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R {totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Actual spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R {remainingBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Budget left</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="budgeted"
                      label={({ name, value }) => `${name}: R${value.toLocaleString()}`}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="income" fill="#82ca9d" name="Income" />
                    <Bar dataKey="expenses" fill="#8884d8" name="Expenses" />
                    <Bar dataKey="savings" fill="#ffc658" name="Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((category) => {
                const percentage = (category.spent / category.budgeted) * 100;
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{category.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        R{category.spent.toLocaleString()} / R{category.budgeted.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(0)}% used</span>
                      <span>R{(category.budgeted - category.spent).toLocaleString()} remaining</span>
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3">Add New Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      placeholder="e.g., Travel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryBudget">Budget Amount</Label>
                    <Input
                      id="categoryBudget"
                      type="number"
                      value={newCategory.budgeted || ''}
                      onChange={(e) => setNewCategory({...newCategory, budgeted: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addCategory} className="w-full">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.slice(0, 5).map((category) => {
                    const trend = Math.random() > 0.5 ? 'up' : 'down';
                    const change = (Math.random() * 20).toFixed(1);
                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">R{category.spent.toLocaleString()}</span>
                          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span className="text-xs">{change}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-green-600">
                    {((totalIncome - totalSpent) / totalIncome * 100).toFixed(1)}%
                  </div>
                  <p className="text-muted-foreground">of income saved this month</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">R{(totalIncome - totalSpent).toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">Amount saved</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">R{((totalIncome - totalSpent) * 12).toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">Annual projection</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Savings Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Emergency Fund</span>
                      <span className="text-sm text-muted-foreground">R75,000 / R100,000</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Vacation Fund</span>
                      <span className="text-sm text-muted-foreground">R12,000 / R30,000</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Car Down Payment</span>
                      <span className="text-sm text-muted-foreground">R18,000 / R50,000</span>
                    </div>
                    <Progress value={36} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-green-600">B+</div>
                  <p className="text-muted-foreground">Your financial health is good</p>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span>Savings Rate</span>
                      <span className="font-medium text-green-600">Excellent</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Budget Adherence</span>
                      <span className="font-medium text-green-600">Good</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Fund</span>
                      <span className="font-medium text-yellow-600">Fair</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goal Progress</span>
                      <span className="font-medium text-blue-600">On Track</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetingPage;