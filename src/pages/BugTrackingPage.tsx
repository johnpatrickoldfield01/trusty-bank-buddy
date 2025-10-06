import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bug, Plus, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddBugDialog } from '@/components/bugs/AddBugDialog';
import { BugCard } from '@/components/bugs/BugCard';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

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

  const downloadBugsPDF = () => {
    if (!bugs || bugs.length === 0) {
      toast({
        title: "No Bugs to Export",
        description: "There are no bugs available to download.",
        variant: "destructive"
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Bug Tracking Report', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, margin, yPosition);
    doc.text(`Total Bugs: ${bugs.length}`, margin, yPosition + 5);
    yPosition += 20;

    // Summary Statistics
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Open: ${openBugs.length}`, margin, yPosition);
    doc.text(`In Progress: ${inProgressBugs.length}`, margin + 50, yPosition);
    doc.text(`Resolved: ${resolvedBugs.length}`, margin + 100, yPosition);
    doc.text(`Blocking Development: ${blockingBugs.length}`, margin + 150, yPosition);
    yPosition += 15;

    // Bug Details
    bugs.forEach((bug, index) => {
      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(bug.blocks_development ? 255 : 0, 0, 0);
      doc.text(`Bug #${index + 1}: ${bug.title}`, margin, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Status badges
      const statusText = `Status: ${bug.status.replace('_', ' ').toUpperCase()} | Priority: ${bug.priority.toUpperCase()} | Category: ${bug.category}`;
      doc.text(statusText, margin, yPosition);
      yPosition += 5;

      if (bug.blocks_development) {
        doc.setTextColor(255, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠ BLOCKS DEVELOPMENT', margin, yPosition);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        yPosition += 5;
      }

      doc.text(`Created: ${format(new Date(bug.created_at), 'PPP')}`, margin, yPosition);
      yPosition += 5;

      if (bug.resolved_at) {
        doc.setTextColor(0, 128, 0);
        doc.text(`Resolved: ${format(new Date(bug.resolved_at), 'PPP')}`, margin, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 5;
      }

      // Description
      doc.setFont('helvetica', 'bold');
      doc.text('Description:', margin, yPosition);
      yPosition += 4;
      
      doc.setFont('helvetica', 'normal');
      const descriptionLines = doc.splitTextToSize(bug.description, pageWidth - 2 * margin);
      descriptionLines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 4;
      });

      // Notes if available
      if (bug.notes) {
        yPosition += 2;
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', margin, yPosition);
        yPosition += 4;
        
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(bug.notes, pageWidth - 2 * margin);
        notesLines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 4;
        });
      }

      yPosition += 8;
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`bug-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Bug report has been downloaded successfully.",
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
        <div className="flex gap-2">
          <Button onClick={downloadBugsPDF} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Report Bug
          </Button>
        </div>
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
            {blockingBugs.map((bug, index) => (
              <BugCard key={bug.id} bug={bug} onUpdate={handleBugUpdate} isBlocking bugNumber={bugs?.findIndex(b => b.id === bug.id)! + 1} />
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
                openBugs.map((bug) => (
                  <BugCard key={bug.id} bug={bug} onUpdate={handleBugUpdate} bugNumber={bugs?.findIndex(b => b.id === bug.id)! + 1} />
                ))
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-3 mt-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : inProgressBugs.length === 0 ? (
                <p className="text-center text-muted-foreground">No issues in progress</p>
              ) : (
                inProgressBugs.map((bug) => (
                  <BugCard key={bug.id} bug={bug} onUpdate={handleBugUpdate} bugNumber={bugs?.findIndex(b => b.id === bug.id)! + 1} />
                ))
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-3 mt-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : resolvedBugs.length === 0 ? (
                <p className="text-center text-muted-foreground">No resolved issues</p>
              ) : (
                resolvedBugs.map((bug) => (
                  <BugCard key={bug.id} bug={bug} onUpdate={handleBugUpdate} bugNumber={bugs?.findIndex(b => b.id === bug.id)! + 1} />
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
