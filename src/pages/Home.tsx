import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Calendar, Shield, Clock, Users, Star } from "lucide-react";
import heroImage from "@/assets/hero-ayurveda.jpg";

const Home = () => {
  const features = [
    {
      icon: Search,
      title: "Find Expert Doctors",
      description: "Search by specialization and book with verified Ayurvedic practitioners"
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book, reschedule, or cancel appointments with real-time availability"
    },
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "All doctors are verified with proper licensing and credentials"
    },
    {
      icon: Clock,
      title: "Flexible Timing",
      description: "Choose between online consultations or in-person visits"
    }
  ];

  const stats = [
    { value: "1000+", label: "Verified Doctors" },
    { value: "50k+", label: "Happy Patients" },
    { value: "4.8", label: "Average Rating" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="relative container py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Authentic Ayurvedic Care,{" "}
              <span className="text-yellow-200">Anywhere , Anytime</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Connect with verified Ayurvedic doctors for personalized consultations. 
              Book appointments, get prescriptions, and heal naturally.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/doctors">
                <Button size="lg" variant="gradient" className="shadow-strong">
                  Find Doctors
                  <Search className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose AyurConsult?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the best of traditional Ayurveda with modern convenience and technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-center hover:shadow-medium transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ayurvedic Specializations
            </h2>
            <p className="text-lg text-muted-foreground">
              Find doctors specialized in various branches of Ayurveda
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "General Ayurveda",
              "Panchakarma",
              "Kayachikitsa",
              "Shalya Tantra",
              "Shalakya Tantra",
              "Kaumara Bhritya"
            ].map((specialization, index) => (
              <Card key={index} className="p-6 hover:shadow-medium transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{specialization}</h3>
                    <p className="text-sm text-muted-foreground">Expert practitioners available</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-trust">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Your Healing Journey?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who have found relief through authentic Ayurvedic treatment
          </p>
          <Link to="/doctors">
            <Button size="lg" className="bg-white text-trust hover:bg-white/90 shadow-strong">
              Book Your First Consultation
              <Calendar className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;