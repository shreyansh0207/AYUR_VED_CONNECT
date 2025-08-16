import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Video, User, MapPin, Star, CheckCircle } from "lucide-react";
import { format, addDays, isToday, isTomorrow } from "date-fns";

// Mock data
const mockDoctor = {
  id: "1",
  name: "Dr. Priya Sharma",
  specialization: "Panchakarma",
  experience: 15,
  rating: 4.8,
  totalReviews: 127,
  consultationFee: 800,
  location: "Delhi, India",
  consultationModes: ["online", "in_person"]
};

const mockSlots = {
  [format(new Date(), 'yyyy-MM-dd')]: [
    { time: "09:00", available: true, mode: "online" },
    { time: "10:00", available: false, mode: "online" },
    { time: "11:00", available: true, mode: "online" },
    { time: "15:00", available: true, mode: "in_person" },
    { time: "16:00", available: true, mode: "in_person" }
  ],
  [format(addDays(new Date(), 1), 'yyyy-MM-dd')]: [
    { time: "09:00", available: true, mode: "online" },
    { time: "10:00", available: true, mode: "online" },
    { time: "14:00", available: true, mode: "in_person" },
    { time: "15:00", available: true, mode: "in_person" }
  ]
};

type BookingStep = "date-time" | "details" | "otp" | "confirmation";

const BookingFlow = () => {
  const { doctorId } = useParams();
  const [currentStep, setCurrentStep] = useState<BookingStep>("date-time");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [lockTimer, setLockTimer] = useState(300); // 5 minutes in seconds

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const availableSlots = selectedDateStr ? mockSlots[selectedDateStr] || [] : [];

  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMM d");
  };

  const handleSlotSelect = (time: string, mode: string) => {
    setSelectedSlot(time);
    setSelectedMode(mode);
  };

  const handleBookSlot = () => {
    if (selectedDate && selectedSlot) {
      // Start 5-minute timer for slot lock
      setCurrentStep("details");
      // In real app, this would make API call to lock the slot
    }
  };

  const handleSubmitDetails = () => {
    setCurrentStep("otp");
    // In real app, this would send OTP
  };

  const handleOtpVerification = () => {
    if (otpCode.length === 6) {
      setCurrentStep("confirmation");
      // In real app, this would verify OTP and confirm booking
    }
  };

  const renderDateTimeStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground">Choose your preferred appointment slot</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Choose Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
            className="rounded-md border"
          />
        </Card>

        {/* Time Slots */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            Available Slots {selectedDate && `- ${formatDateDisplay(selectedDate)}`}
          </h3>
          
          {!selectedDate ? (
            <p className="text-muted-foreground">Please select a date first</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-muted-foreground">No slots available for this date</p>
          ) : (
            <div className="space-y-3">
              {availableSlots.map((slot) => (
                <Button
                  key={`${slot.time}-${slot.mode}`}
                  variant={selectedSlot === slot.time && selectedMode === slot.mode ? "default" : "outline"}
                  className="w-full justify-between p-4 h-auto"
                  disabled={!slot.available}
                  onClick={() => handleSlotSelect(slot.time, slot.mode)}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{slot.time}</span>
                    <Badge variant="secondary" className="text-xs">
                      {slot.mode === "online" ? (
                        <>
                          <Video className="h-3 w-3 mr-1" />
                          Online
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          In Person
                        </>
                      )}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">₹{mockDoctor.consultationFee}</span>
                </Button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {selectedDate && selectedSlot && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Selected Appointment</h4>
              <p className="text-sm text-muted-foreground">
                {formatDateDisplay(selectedDate)} at {selectedSlot} ({selectedMode})
              </p>
            </div>
            <Button onClick={handleBookSlot} className="bg-gradient-primary">
              Proceed to Book
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Appointment Details</h2>
        <p className="text-muted-foreground">
          Please provide your symptoms and concerns (Slot reserved for 5 minutes)
        </p>
      </div>

      <Card className="p-6 border-orange-200 bg-orange-50">
        <div className="flex items-center space-x-2 text-orange-700">
          <Clock className="h-5 w-5" />
          <span className="font-medium">
            Slot reserved for {Math.floor(lockTimer / 60)}:{(lockTimer % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Symptoms & Concerns *
            </label>
            <Textarea
              placeholder="Please describe your symptoms, concerns, or reason for consultation..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep("date-time")}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleSubmitDetails}
              disabled={!symptoms.trim()}
              className="flex-1 bg-gradient-primary"
            >
              Continue
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Appointment Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gradient-accent flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium">{mockDoctor.name}</p>
                <p className="text-sm text-muted-foreground">{mockDoctor.specialization}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">
                  {selectedDate && formatDateDisplay(selectedDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium">{selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-medium capitalize">{selectedMode}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Consultation Fee:</span>
                <span className="font-semibold">₹{mockDoctor.consultationFee}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to your registered mobile number
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter OTP Code
            </label>
            <Input
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep("details")}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handleOtpVerification}
              disabled={otpCode.length !== 6}
              className="flex-1 bg-gradient-primary"
            >
              Verify & Confirm
            </Button>
          </div>

          <div className="text-center">
            <Button variant="link" className="text-sm">
              Resend OTP
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your appointment has been successfully booked
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Appointment Details</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 pb-4 border-b">
            <div className="h-12 w-12 rounded-full bg-gradient-accent flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-medium">{mockDoctor.name}</p>
              <p className="text-sm text-muted-foreground">{mockDoctor.specialization}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{mockDoctor.rating} ({mockDoctor.totalReviews} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date & Time</p>
              <p className="font-medium">
                {selectedDate && formatDateDisplay(selectedDate)} at {selectedSlot}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Consultation Mode</p>
              <p className="font-medium capitalize">{selectedMode}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Booking ID</p>
              <p className="font-medium">APT001234</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount Paid</p>
              <p className="font-medium">₹{mockDoctor.consultationFee}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex space-x-4">
        <Link to="/appointments" className="flex-1">
          <Button variant="outline" className="w-full">
            View My Appointments
          </Button>
        </Link>
        <Link to="/doctors" className="flex-1">
          <Button className="w-full bg-gradient-primary">
            Book Another Appointment
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-8">
        <div className="container">
          <div className="flex items-center space-x-4">
            <Link to="/doctors">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Doctors
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Book Appointment</h1>
              <p className="text-white/90">with {mockDoctor.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { step: "date-time", label: "Date & Time" },
              { step: "details", label: "Details" },
              { step: "otp", label: "Verification" },
              { step: "confirmation", label: "Confirmation" }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === item.step 
                    ? "bg-primary text-primary-foreground" 
                    : index < ["date-time", "details", "otp", "confirmation"].indexOf(currentStep)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:inline">
                  {item.label}
                </span>
                {index < 3 && (
                  <div className="h-0.5 w-8 bg-muted mx-4 hidden sm:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "date-time" && renderDateTimeStep()}
        {currentStep === "details" && renderDetailsStep()}
        {currentStep === "otp" && renderOtpStep()}
        {currentStep === "confirmation" && renderConfirmationStep()}
      </div>
    </div>
  );
};

export default BookingFlow;