import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Play, Pause, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BulkPaymentSchedule {
  id: string;
  schedule_name: string;
  beneficiary_ids: string[];
  amount_per_beneficiary: number;
  frequency: string;
  next_execution_date: string;
  is_active: boolean;
  created_at: string;
}

const BulkPaymentScheduler = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    schedule_name: '',
    amount_per_beneficiary: '',
    frequency: 'monthly',
    next_execution_date: ''
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['bulk_payment_schedules', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bulk_payment_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BulkPaymentSchedule[];
    },
    enabled: !!user,
  });

  const { data: beneficiaries } = useQuery({
    queryKey: ['beneficiaries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createSchedule = useMutation({
    mutationFn: async (scheduleData: any) => {
      const { data, error } = await supabase
        .from('bulk_payment_schedules')
        .insert([{
          user_id: user?.id,
          schedule_name: scheduleData.schedule_name,
          beneficiary_ids: beneficiaries?.map(b => b.id) || [],
          amount_per_beneficiary: parseFloat(scheduleData.amount_per_beneficiary),
          frequency: scheduleData.frequency,
          next_execution_date: scheduleData.next_execution_date,
          is_active: true
        }]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Bulk payment schedule created successfully');
      setIsCreating(false);
      setNewSchedule({
        schedule_name: '',
        amount_per_beneficiary: '',
        frequency: 'monthly',
        next_execution_date: ''
      });
      queryClient.invalidateQueries({ queryKey: ['bulk_payment_schedules'] });
    },
    onError: (error) => {
      toast.error(`Failed to create schedule: ${error.message}`);
    }
  });

  const toggleSchedule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('bulk_payment_schedules')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk_payment_schedules'] });
    }
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bulk_payment_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Schedule deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['bulk_payment_schedules'] });
    }
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.schedule_name || !newSchedule.amount_per_beneficiary || !newSchedule.next_execution_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    createSchedule.mutate(newSchedule);
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading payment schedules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Bulk Payment Scheduler</h3>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : 'Create Schedule'}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule_name">Schedule Name</Label>
                <Input
                  id="schedule_name"
                  value={newSchedule.schedule_name}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, schedule_name: e.target.value }))}
                  placeholder="Monthly Salary Payments"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount per Beneficiary (R)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newSchedule.amount_per_beneficiary}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, amount_per_beneficiary: e.target.value }))}
                  placeholder="5000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newSchedule.frequency} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate Clearance</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="next_execution">
                  {newSchedule.frequency === 'immediate' ? 'Execution Date' : 'Next Execution Date'}
                </Label>
                <Input
                  id="next_execution"
                  type="datetime-local"
                  value={newSchedule.next_execution_date}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, next_execution_date: e.target.value }))}
                />
              </div>
            </div>

            {/* KYC Verified Beneficiaries Selection */}
            <div className="space-y-2">
              <Label>KYC Verified Beneficiaries ({beneficiaries?.length || 0} available)</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                {beneficiaries?.map((beneficiary: any) => (
                  <div key={beneficiary.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="text-sm">
                      <div className="font-medium">{beneficiary.beneficiary_name}</div>
                      <div className="text-muted-foreground">{beneficiary.bank_name} • {beneficiary.account_number}</div>
                    </div>
                    <Badge variant="secondary" className="text-green-600">KYC ✓</Badge>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No beneficiaries available</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule} disabled={createSchedule.isPending}>
                Create Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {schedules?.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{schedule.schedule_name}</h4>
                    <Badge variant={schedule.is_active ? "default" : "secondary"}>
                      {schedule.is_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    R{schedule.amount_per_beneficiary.toLocaleString()} per beneficiary • {schedule.frequency}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Next: {format(new Date(schedule.next_execution_date), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSchedule.mutate({ id: schedule.id, is_active: schedule.is_active })}
                  >
                    {schedule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteSchedule.mutate(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!schedules || schedules.length === 0) && !isCreating && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No payment schedules found. Create your first bulk payment schedule.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkPaymentScheduler;