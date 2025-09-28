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
import { Calendar, Clock, Play, Pause, Trash2, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import BeneficiaryManager from './BeneficiaryManager';
import BulkPaymentPDFDownloader from './BulkPaymentPDFDownloader';

interface BulkPaymentSchedule {
  id: string;
  schedule_name: string;
  beneficiary_ids: string[];
  amount_per_beneficiary: number;
  frequency: string;
  next_execution_date: string;
  is_active: boolean;
  created_at: string;
  currency?: string;
}

const BulkPaymentScheduler = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    schedule_name: '',
    amount_per_beneficiary: '',
    frequency: 'monthly',
    next_execution_date: '',
    currency: 'ZAR'
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
          beneficiary_ids: selectedBeneficiaries.length > 0 ? selectedBeneficiaries : beneficiaries?.map(b => b.id) || [],
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
      setSelectedBeneficiaries([]);
      setNewSchedule({
        schedule_name: '',
        amount_per_beneficiary: '',
        frequency: 'monthly',
        next_execution_date: '',
        currency: 'ZAR'
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

    if (selectedBeneficiaries.length === 0 && (!beneficiaries || beneficiaries.length === 0)) {
      toast.error('Please select at least one beneficiary');
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
                <Label htmlFor="currency">Currency</Label>
                <Select value={newSchedule.currency || 'ZAR'} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZAR">ZAR (South African Rand)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                    <SelectItem value="HKD">HKD (Hong Kong Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="amount">Amount per Beneficiary</Label>
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

            {/* Real Bank Account Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Select Real Bank Accounts (Max 20 per batch)</Label>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {selectedBeneficiaries.length}/20 selected
                </Badge>
              </div>
              
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <BeneficiaryManager
                  selectionMode={true}
                  selectedBeneficiaries={selectedBeneficiaries}
                  onSelectionChange={setSelectedBeneficiaries}
                />
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
                    {schedule.currency || 'ZAR'} {schedule.amount_per_beneficiary.toLocaleString()} per beneficiary • {schedule.frequency}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Next: {format(new Date(schedule.next_execution_date), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <BulkPaymentPDFDownloader
                    schedule={schedule}
                    beneficiaries={beneficiaries?.filter(b => schedule.beneficiary_ids.includes(b.id)) || []}
                    downloadType="bulk"
                  />
                  <BulkPaymentPDFDownloader
                    schedule={schedule}
                    beneficiaries={beneficiaries?.filter(b => schedule.beneficiary_ids.includes(b.id)) || []}
                    downloadType="individual"
                  />
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