import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvailabilityRule {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  consultation_mode: 'online' | 'in-person' | 'both';
  is_active: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface AvailabilitySetupProps {
  doctorId: string;
}

export default function AvailabilitySetup({ doctorId }: AvailabilitySetupProps) {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newRule, setNewRule] = useState<Omit<AvailabilityRule, 'id'>>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration: 30,
    consultation_mode: 'both',
    is_active: true
  });

  useEffect(() => {
    fetchAvailabilityRules();
  }, [doctorId]);

  const fetchAvailabilityRules = async () => {
    try {
      const { data, error } = await supabase
        .from('availability_rules')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('day_of_week');

      if (error) throw error;
      setRules((data || []) as AvailabilityRule[]);
    } catch (error) {
      console.error('Error fetching availability rules:', error);
      toast.error('Failed to load availability rules');
    } finally {
      setLoading(false);
    }
  };

  const addRule = async () => {
    if (rules.some(rule => rule.day_of_week === newRule.day_of_week)) {
      toast.error('Rule for this day already exists');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('availability_rules')
        .insert([{ ...newRule, doctor_id: doctorId }])
        .select()
        .single();

      if (error) throw error;

      setRules(prev => [...prev, data as AvailabilityRule].sort((a, b) => a.day_of_week - b.day_of_week));
      
      // Generate time slots for this rule
      await generateTimeSlots(data as AvailabilityRule);
      
      toast.success('Availability rule added successfully');
    } catch (error) {
      console.error('Error adding availability rule:', error);
      toast.error('Failed to add availability rule');
    } finally {
      setSaving(false);
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<AvailabilityRule>) => {
    try {
      const { error } = await supabase
        .from('availability_rules')
        .update(updates)
        .eq('id', ruleId);

      if (error) throw error;

      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ));

      toast.success('Availability rule updated');
    } catch (error) {
      console.error('Error updating availability rule:', error);
      toast.error('Failed to update availability rule');
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('availability_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast.success('Availability rule deleted');
    } catch (error) {
      console.error('Error deleting availability rule:', error);
      toast.error('Failed to delete availability rule');
    }
  };

  const generateTimeSlots = async (rule: AvailabilityRule) => {
    try {
      // Generate slots for next 30 days
      const today = new Date();
      const slots = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Check if this date matches the rule's day of week
        if (date.getDay() === rule.day_of_week) {
          const startTime = rule.start_time;
          const endTime = rule.end_time;
          const duration = rule.slot_duration;

          // Generate time slots for this day
          const start = new Date(`${date.toISOString().split('T')[0]}T${startTime}`);
          const end = new Date(`${date.toISOString().split('T')[0]}T${endTime}`);

          while (start < end) {
            const slotEnd = new Date(start.getTime() + duration * 60000);
            
            if (slotEnd <= end) {
              const modes = rule.consultation_mode === 'both' 
                ? ['online', 'in-person'] 
                : [rule.consultation_mode];

              for (const mode of modes) {
                slots.push({
                  doctor_id: doctorId,
                  slot_date: date.toISOString().split('T')[0],
                  start_time: start.toTimeString().slice(0, 5),
                  end_time: slotEnd.toTimeString().slice(0, 5),
                  consultation_mode: mode,
                  is_booked: false,
                  is_locked: false
                });
              }
            }
            
            start.setTime(start.getTime() + duration * 60000);
          }
        }
      }

      // Insert slots in batches
      if (slots.length > 0) {
        const { error } = await supabase
          .from('time_slots')
          .insert(slots);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error generating time slots:', error);
    }
  };

  if (loading) {
    return <div>Loading availability settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Availability Rule</CardTitle>
          <CardDescription>
            Set your recurring weekly availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={newRule.day_of_week.toString()}
                onValueChange={(value) => 
                  setNewRule(prev => ({ ...prev, day_of_week: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={newRule.start_time}
                onChange={(e) => 
                  setNewRule(prev => ({ ...prev, start_time: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={newRule.end_time}
                onChange={(e) => 
                  setNewRule(prev => ({ ...prev, end_time: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Slot Duration (minutes)</Label>
              <Select
                value={newRule.slot_duration.toString()}
                onValueChange={(value) => 
                  setNewRule(prev => ({ ...prev, slot_duration: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Consultation Mode</Label>
            <Select
              value={newRule.consultation_mode}
              onValueChange={(value: 'online' | 'in-person' | 'both') => 
                setNewRule(prev => ({ ...prev, consultation_mode: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online Only</SelectItem>
                <SelectItem value="in-person">In-Person Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={addRule} disabled={saving} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {saving ? 'Adding...' : 'Add Availability Rule'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Availability Rules</CardTitle>
          <CardDescription>
            Manage your weekly availability schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No availability rules set. Add your first rule above.
            </p>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {DAYS_OF_WEEK.find(d => d.value === rule.day_of_week)?.label}
                        </Badge>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.start_time} - {rule.end_time} 
                        ({rule.slot_duration} min slots, {rule.consultation_mode})
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => 
                          updateRule(rule.id!, { is_active: checked })
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRule(rule.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}