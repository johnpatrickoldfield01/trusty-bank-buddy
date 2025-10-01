import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bug, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddBugDialog } from '@/components/bugs/AddBugDialog';
import { BugCard } from '@/components/bugs/BugCard';

export default function BugTrackingPage() {
  const { session } = useSession();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: bugs, isLoading, refetch } = useQuery({
    queryKey: ['bug-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const openBugs = bugs?.filter(bug => bug.status === 'open') || [];
  const inProgressBugs = bugs?.filter(bug => bug.status === 'in_progress') || [];
  const resolvedBugs = bugs?.filter(bug => bug.status === 'resolved') || [];
  const blockingBugs = bugs?.filter(bug => bug.blocks_development && bug.status !== 'resolved') || [];

  const handleBugUpdate = async () => {
    await refetch();
    toast({
      title: "Bug Updated",
      description: "Bug status has been updated successfully.",
    });
  };

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to access bug tracking.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bug className="h-8 w-8" />
            Bug Tracking & Development Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage known issues restricting development
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Report Bug
        </Button>
      </div>

      {blockingBugs.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Critical: Blocking Development ({blockingBugs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockingBugs.map(bug => (
              <BugCard key={bug.id} bug={bug} onUpdate={handleBugUpdate} isBlocking />
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Issues</p>
                <p className="text-3xl font-bold">{openBugs.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold">{inProgressBugs.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold">{resolvedBugs.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="open">
                Open ({openBugs.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({inProgressBugs.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({resolvedBugs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-3 mt-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : openBugs.length === 0 ? (
                <p className="text-center text-muted-foreground">No open issues</p>
              ) : (
                openBugs.map(bug => (
                  <BugCard key={bug.id} bug={bug} onUpdate={handleBugUpdate} />
                ))
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-3 mt-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : inProgressBugs.length === 0 ? (
                <p className="text-center text-muted-foreground">No issues in progress</p>
              ) : (
                inProgressBugs.map(bug => (
                  <BugCard key={bug.id} bug={bug} onUpdate={handleBugUpdate} />
                ))
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-3 mt-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : resolvedBugs.length === 0 ? (
                <p className="text-center text-muted-foreground">No resolved issues</p>
              ) : (
                resolvedBugs.map(bug => (
                  <BugCard key={bug.id} bug={bug} onUpdate={handleBugUpdate} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddBugDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
