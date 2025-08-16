import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Clock, Users, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import AvailabilitySetup from '@/components/doctor/AvailabilitySetup';
import AppointmentsList from '@/components/doctor/AppointmentsList';
import DoctorProfile from '@/components/doctor/DoctorProfile';

export default function DoctorDashboard() {
  const { user, userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weeklyAppointments: 0,
    totalPatients: 0
  });
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDoctorData();
    }
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      // Check if doctor profile exists
      const { data: doctor } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (!doctor) {
        setLoading(false);
        return;
      }

      setDoctorProfile(doctor);

      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_id_fkey(full_name, phone)
        `)
        .eq('doctor_id', doctor.id)
        .order('appointment_date', { ascending: true });

      setAppointments(appointmentsData || []);

      // Calculate stats
      const today = new Date().toDateString();
      const todayCount = appointmentsData?.filter(
        apt => new Date(apt.appointment_date).toDateString() === today
      ).length || 0;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyCount = appointmentsData?.filter(
        apt => new Date(apt.appointment_date) >= oneWeekAgo
      ).length || 0;

      const uniquePatients = new Set(appointmentsData?.map(apt => apt.patient_id)).size;

      setStats({
        todayAppointments: todayCount,
        weeklyAppointments: weeklyCount,
        totalPatients: uniquePatients
      });
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Doctor Profile</CardTitle>
            <CardDescription>
              Please complete your doctor profile to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DoctorProfile onProfileCreated={fetchDoctorData} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Dr. {doctorProfile.name}
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {doctorProfile.specialization}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Appointments this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Unique patients served
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  Select a date to view appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Appointments for {selectedDate?.toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments
                    .filter(apt => 
                      new Date(apt.appointment_date).toDateString() === selectedDate?.toDateString()
                    )
                    .map((appointment: any) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.start_time} - {appointment.end_time}
                          </p>
                        </div>
                        <Badge variant={appointment.status === 'booked' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  {appointments.filter(apt => 
                    new Date(apt.appointment_date).toDateString() === selectedDate?.toDateString()
                  ).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No appointments scheduled for this date
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentsList doctorId={doctorProfile.id} />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilitySetup doctorId={doctorProfile.id} />
        </TabsContent>

        <TabsContent value="profile">
          <DoctorProfile doctorData={doctorProfile} onProfileUpdated={fetchDoctorData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}