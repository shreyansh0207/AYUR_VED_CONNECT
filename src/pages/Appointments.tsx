import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Video, User, MapPin, MoreVertical, Phone } from "lucide-react";
import { format, isPast, isToday, addHours } from "date-fns";

// Mock appointments data
const mockAppointments = [
  {
    id: "1",
    doctorName: "Dr. Priya Sharma",
    specialization: "Panchakarma",
    date: new Date(2024, 11, 16, 15, 0), // Today 3:00 PM
    mode: "online",
    status: "confirmed",
    fee: 800,
    symptoms: "Chronic fatigue and digestive issues",
    bookingId: "APT001234"
  },
  {
    id: "2",
    doctorName: "Dr. Rajesh Kumar", 
    specialization: "Kayachikitsa",
    date: new Date(2024, 11, 18, 10, 0), // Day after tomorrow
    mode: "in_person",
    status: "confirmed",
    fee: 1200,
    symptoms: "Joint pain and stiffness",
    bookingId: "APT001235"
  },
  {
    id: "3",
    doctorName: "Dr. Meera Nair",
    specialization: "Shalakya Tantra",
    date: new Date(2024, 11, 10, 18, 0), // Past appointment
    mode: "online",
    status: "completed",
    fee: 900,
    symptoms: "Migraine and eye strain",
    bookingId: "APT001230",
    prescription: "Triphala churna twice daily, Brahmi ghrita for nasal drops"
  },
  {
    id: "4",
    doctorName: "Dr. Anand Krishnan",
    specialization: "General Ayurveda",
    date: new Date(2024, 11, 5, 14, 0), // Cancelled appointment
    mode: "in_person",
    status: "cancelled",
    fee: 700,
    symptoms: "General wellness consultation",
    bookingId: "APT001228",
    cancelledReason: "Doctor unavailable due to emergency"
  }
];

const Appointments = () => {
  const [selectedTab, setSelectedTab] = useState("upcoming");

  const upcomingAppointments = mockAppointments.filter(apt => 
    !isPast(apt.date) && apt.status !== "cancelled" && apt.status !== "completed"
  );

  const pastAppointments = mockAppointments.filter(apt => 
    isPast(apt.date) || apt.status === "completed" || apt.status === "cancelled"
  );

  const canReschedule = (appointmentDate: Date) => {
    const hoursUntilAppointment = (appointmentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hoursUntilAppointment > 24;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-primary text-primary-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      case "cancelled": return "bg-destructive text-destructive-foreground";
      case "rescheduled": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatAppointmentDate = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    }
    return format(date, 'EEE, MMM d, yyyy • h:mm a');
  };

  const AppointmentCard = ({ appointment, showActions = true }: { appointment: any, showActions?: boolean }) => (
    <Card className="p-6 hover:shadow-medium transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-accent flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
            <p className="text-accent text-sm font-medium">{appointment.specialization}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
              <span className="text-xs text-muted-foreground">#{appointment.bookingId}</span>
            </div>
          </div>
        </div>
        {showActions && (
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatAppointmentDate(appointment.date)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          {appointment.mode === "online" ? (
            <Video className="h-4 w-4 text-muted-foreground" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="capitalize">{appointment.mode} consultation</span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Fee:</span>
          <span className="font-medium">₹{appointment.fee}</span>
        </div>

        {appointment.symptoms && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm">
              <span className="font-medium text-muted-foreground">Symptoms: </span>
              {appointment.symptoms}
            </p>
          </div>
        )}

        {appointment.prescription && (
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
            <p className="text-sm">
              <span className="font-medium text-primary">Prescription: </span>
              {appointment.prescription}
            </p>
          </div>
        )}

        {appointment.cancelledReason && (
          <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/20">
            <p className="text-sm">
              <span className="font-medium text-destructive">Cancellation Reason: </span>
              {appointment.cancelledReason}
            </p>
          </div>
        )}
      </div>

      {showActions && appointment.status === "confirmed" && (
        <div className="flex space-x-2">
          {isToday(appointment.date) && (
            <Button size="sm" className="bg-gradient-primary hover:bg-primary-hover">
              <Video className="h-4 w-4 mr-2" />
              Join Call
            </Button>
          )}
          {canReschedule(appointment.date) && (
            <>
              <Button variant="outline" size="sm">
                Reschedule
              </Button>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-12">
        <div className="container">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">My Appointments</h1>
          <p className="text-lg text-white/90">
            Manage your consultations and track your health journey
          </p>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-8">
            {upcomingAppointments.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground mb-4">
                  Book a consultation with our expert Ayurvedic doctors
                </p>
                <Button className="bg-gradient-primary">
                  Find Doctors
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-8">
            {pastAppointments.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No past appointments</h3>
                <p className="text-muted-foreground">
                  Your consultation history will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Appointments;