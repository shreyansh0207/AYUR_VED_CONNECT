-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  consultation_fee INTEGER NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability_rules table for recurring schedules
CREATE TABLE public.availability_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER DEFAULT 30, -- in minutes
  consultation_mode TEXT NOT NULL CHECK (consultation_mode IN ('online', 'in-person', 'both')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_slots table for specific available slots
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  consultation_mode TEXT NOT NULL CHECK (consultation_mode IN ('online', 'in-person')),
  is_booked BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  locked_until TIMESTAMP WITH TIME ZONE,
  locked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  slot_id UUID REFERENCES public.time_slots(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  consultation_mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  otp_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL DEFAULT 'patient' CHECK (user_type IN ('patient', 'doctor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for doctors
CREATE POLICY "Doctors can view all doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can update their own profile" ON public.doctors 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Doctors can insert their own profile" ON public.doctors 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for availability_rules
CREATE POLICY "Anyone can view availability rules" ON public.availability_rules FOR SELECT USING (true);
CREATE POLICY "Doctors can manage their availability" ON public.availability_rules 
  FOR ALL USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- Create RLS policies for time_slots
CREATE POLICY "Anyone can view available slots" ON public.time_slots FOR SELECT USING (true);
CREATE POLICY "Doctors can manage their slots" ON public.time_slots 
  FOR ALL USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- Create RLS policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments 
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
  );
CREATE POLICY "Patients can create appointments" ON public.appointments 
  FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Users can update their own appointments" ON public.appointments 
  FOR UPDATE USING (
    patient_id = auth.uid() OR 
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
  );

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_rules_updated_at
  BEFORE UPDATE ON public.availability_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to automatically unlock expired slots
CREATE OR REPLACE FUNCTION public.unlock_expired_slots()
RETURNS void AS $$
BEGIN
  UPDATE public.time_slots 
  SET is_locked = false, locked_until = NULL, locked_by = NULL
  WHERE is_locked = true AND locked_until < now();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX idx_availability_rules_doctor_id ON public.availability_rules(doctor_id);
CREATE INDEX idx_availability_rules_day_of_week ON public.availability_rules(day_of_week);
CREATE INDEX idx_time_slots_doctor_id ON public.time_slots(doctor_id);
CREATE INDEX idx_time_slots_date ON public.time_slots(slot_date);
CREATE INDEX idx_time_slots_booking ON public.time_slots(is_booked, is_locked);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);