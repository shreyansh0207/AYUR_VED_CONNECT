import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Video, User } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - In real app, this would come from Supabase
const mockDoctors = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    specialization: "Panchakarma",
    experience: 15,
    rating: 4.8,
    totalReviews: 127,
    consultationFee: 800,
    location: "Delhi, India",
    languages: ["English", "Hindi"],
    nextAvailable: "Today 3:00 PM",
    consultationModes: ["online", "in_person"],
    image: "/api/placeholder/100/100"
  },
  {
    id: "2", 
    name: "Dr. Rajesh Kumar",
    specialization: "Kayachikitsa",
    experience: 22,
    rating: 4.9,
    totalReviews: 203,
    consultationFee: 1200,
    location: "Mumbai, India",
    languages: ["English", "Hindi", "Marathi"],
    nextAvailable: "Tomorrow 10:00 AM",
    consultationModes: ["online", "in_person"],
    image: "/api/placeholder/100/100"
  },
  {
    id: "3",
    name: "Dr. Meera Nair",
    specialization: "Shalakya Tantra",
    experience: 18,
    rating: 4.7,
    totalReviews: 156,
    consultationFee: 900,
    location: "Bangalore, India",
    languages: ["English", "Hindi", "Malayalam"],
    nextAvailable: "Today 6:00 PM",
    consultationModes: ["online"],
    image: "/api/placeholder/100/100"
  },
  {
    id: "4",
    name: "Dr. Anil Gupta",
    specialization: "Shalya Tantra",
    experience: 10,
    rating: 4.5,
    totalReviews: 89,
    consultationFee: 700,
    location: "Chennai, India",
    languages: ["English", "Tamil"],
    nextAvailable: "Tomorrow 11:00 AM",
    consultationModes: ["in_person"],
    image: "/api/placeholder/100/100"
  },
  {
    id: "5",
    name: "Dr. Sita Devi",
    specialization: "Kaumara Bhritya",
    experience: 12,
    rating: 4.6,
    totalReviews: 110,
    consultationFee: 950,
    location: "Kolkata, India",
    languages: ["English", "Bengali"],
    nextAvailable: "Today 4:00 PM",
    consultationModes: ["online", "in_person"],
    image: "/api/placeholder/100/100"
  }
  // Add more mock doctors as needed
  
];

const specializations = [
  "All Specializations",
  "General Ayurveda",
  "Panchakarma", 
  "Kayachikitsa",
  "Shalya Tantra",
  "Shalakya Tantra",
  "Kaumara Bhritya"
];

const Doctors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [selectedMode, setSelectedMode] = useState("all");

  const filteredDoctors = mockDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = selectedSpecialization === "All Specializations" || 
                                 doctor.specialization === selectedSpecialization;
    const matchesMode = selectedMode === "all" || doctor.consultationModes.includes(selectedMode);
    
    return matchesSearch && matchesSpecialization && matchesMode;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-12">
        <div className="container">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Find Ayurvedic Doctors</h1>
          <p className="text-lg text-white/90">
            Connect with verified practitioners for personalized consultations
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors or specializations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger>
                <SelectValue placeholder="Consultation Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-gradient-primary hover:bg-primary-hover">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredDoctors.length} doctors
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-medium transition-shadow">
              <div className="p-6">
                {/* Doctor Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{doctor.name}</h3>
                    <p className="text-accent text-sm font-medium">{doctor.specialization}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{doctor.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({doctor.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{doctor.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {doctor.consultationModes.map((mode) => (
                      <Badge key={mode} variant="secondary" className="text-xs">
                        {mode === "online" ? (
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
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Consultation Fee</p>
                      <p className="text-lg font-semibold text-primary">₹{doctor.consultationFee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Next Available</p>
                      <p className="text-sm font-medium text-accent">{doctor.nextAvailable}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link to={`/doctors/${doctor.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                  <Link to={`/book/${doctor.id}`} className="flex-1">
                    <Button className="w-full bg-gradient-primary hover:bg-primary-hover">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialization("All Specializations");
                setSelectedMode("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Doctors;