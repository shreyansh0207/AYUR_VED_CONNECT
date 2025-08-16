import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin, Video, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CalendarSlotPickerProps {
  doctorId: string;
  onSlotSelected: (slot: any) => void;
  selectedSlot?: any;
}

export default function CalendarSlotPicker({ 
  doctorId, 
  onSlotSelected, 
  selectedSlot 
}: CalendarSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [consultationMode, setConsultationMode] = useState<'online' | 'in-person' | 'all'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctorId, consultationMode]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      let query = supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('slot_date', dateStr)
        .eq('is_booked', false)
        .eq('is_locked', false)
        .order('start_time');

      if (consultationMode !== 'all') {
        query = query.eq('consultation_mode', consultationMode);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = async (slot: any) => {
    try {
      // Lock the slot for 5 minutes
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 5);

      const { error } = await supabase
        .from('time_slots')
        .update({
          is_locked: true,
          locked_until: lockUntil.toISOString(),
          locked_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', slot.id);

      if (error) throw error;

      onSlotSelected({ ...slot, locked_until: lockUntil.toISOString() });
      toast.success('Slot reserved for 5 minutes');
    } catch (error) {
      console.error('Error locking slot:', error);
      toast.error('Failed to reserve slot');
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group slots by time for better display
  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const key = `${slot.start_time}-${slot.end_time}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(slot);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Date & Time</CardTitle>
          <CardDescription>
            Choose your preferred appointment date and time slot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < new Date()}
                  className={cn("rounded-md border pointer-events-auto")}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Consultation Mode</h3>
                <Select
                  value={consultationMode}
                  onValueChange={(value: 'online' | 'in-person' | 'all') => 
                    setConsultationMode(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="online">Online Only</SelectItem>
                    <SelectItem value="in-person">In-Person Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <h3 className="font-semibold">
                Available Slots for {selectedDate.toLocaleDateString()}
              </h3>
              
              {loading ? (
                <div className="text-center py-8">Loading slots...</div>
              ) : Object.keys(groupedSlots).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No available slots for this date
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(groupedSlots).map(([timeRange, slots]) => {
                    const [startTime, endTime] = timeRange.split('-');
                    
                    return (
                      <div key={timeRange} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatTime(startTime)} - {formatTime(endTime)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {(slots as any[]).map((slot) => (
                            <Button
                              key={slot.id}
                              variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSlotSelect(slot)}
                              className="flex items-center gap-1"
                            >
                              {slot.consultation_mode === 'online' ? (
                                <Video className="h-3 w-3" />
                              ) : (
                                <MapPin className="h-3 w-3" />
                              )}
                              {slot.consultation_mode}
                              {selectedSlot?.id === slot.id && (
                                <CheckCircle2 className="h-3 w-3 ml-1" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {selectedSlot && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-semibold">Selected Slot</span>
              </div>
              <div className="text-sm space-y-1">
                <p>Date: {new Date(selectedSlot.slot_date).toLocaleDateString()}</p>
                <p>Time: {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</p>
                <p>Mode: {selectedSlot.consultation_mode}</p>
                <Badge variant="outline" className="mt-2">
                  Reserved for 5 minutes
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}