import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';

interface Bug {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  blocks_development: boolean;
  created_at: string;
  notes?: string | null;
  resolved_at?: string | null;
}

interface BugCardProps {
  bug: Bug;
  onUpdate: () => void;
  isBlocking?: boolean;
}

export function BugCard({ bug, onUpdate, isBlocking }: BugCardProps) {
  const { session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(bug.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getCategoryIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = session?.user?.id;
      }

      const { error } = await supabase
        .from('bug_reports')
        .update(updateData)
        .eq('id', bug.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating bug status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotesUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ notes })
        .eq('id', bug.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={isBlocking ? 'border-destructive' : ''}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(bug.status)}
                <h3 className="font-semibold">{bug.title}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant={getPriorityColor(bug.priority)}>
                  {bug.priority.toUpperCase()}
                </Badge>
                <Badge variant="outline">{bug.category}</Badge>
                {bug.blocks_development && (
                  <Badge variant="destructive">BLOCKS DEVELOPMENT</Badge>
                )}
                <Badge variant="secondary">{bug.status.replace('_', ' ').toUpperCase()}</Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Created: {format(new Date(bug.created_at), 'PPP')}
              </p>
              {bug.resolved_at && (
                <p className="text-sm text-green-600">
                  Resolved: {format(new Date(bug.resolved_at), 'PPP')}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Select
                value={bug.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-3 pt-3 border-t">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {bug.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this bug..."
                  className="min-h-[80px]"
                />
                <Button
                  onClick={handleNotesUpdate}
                  disabled={isUpdating || notes === bug.notes}
                  className="mt-2"
                  size="sm"
                >
                  {isUpdating ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
