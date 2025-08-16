import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DoctorProfileProps {
  doctorData?: any;
  onProfileCreated?: () => void;
  onProfileUpdated?: () => void;
}

const SPECIALIZATIONS = [
  'General Medicine',
  'Panchakarma',
  'Rasayana (Rejuvenation)',
  'Swasthavritta (Preventive Medicine)',
  'Kayachikitsa (Internal Medicine)',
  'Shalya Tantra (Surgery)',
  'Shalakya Tantra (ENT & Ophthalmology)',
  'Kaumarbhritya (Pediatrics)',
  'Streeroga (Gynecology)',
  'Agadtantra (Toxicology)',
  'Dravyaguna (Pharmacology)',
  'Rasa Shastra (Pharmaceutics)',
];

export default function DoctorProfile({ 
  doctorData, 
  onProfileCreated, 
  onProfileUpdated 
}: DoctorProfileProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience_years: 0,
    consultation_fee: 0,
    bio: '',
    phone: '',
  });

  useEffect(() => {
    if (doctorData) {
      setFormData({
        name: doctorData.name || '',
        specialization: doctorData.specialization || '',
        experience_years: doctorData.experience_years || 0,
        consultation_fee: doctorData.consultation_fee || 0,
        bio: doctorData.bio || '',
        phone: doctorData.phone || '',
      });
    }
  }, [doctorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (doctorData) {
        // Update existing profile
        const { error } = await supabase
          .from('doctors')
          .update(formData)
          .eq('id', doctorData.id);

        if (error) throw error;
        
        toast.success('Profile updated successfully');
        onProfileUpdated?.();
      } else {
        // Create new profile
        const { error } = await supabase
          .from('doctors')
          .insert([{
            ...formData,
            user_id: user?.id,
          }]);

        if (error) throw error;
        
        toast.success('Doctor profile created successfully');
        onProfileCreated?.();
      }
    } catch (error: any) {
      console.error('Error saving doctor profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {doctorData ? 'Update Doctor Profile' : 'Create Doctor Profile'}
        </CardTitle>
        <CardDescription>
          {doctorData 
            ? 'Update your professional information' 
            : 'Complete your doctor profile to access the dashboard'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization *</Label>
            <Select
              value={formData.specialization}
              onValueChange={(value) => handleInputChange('specialization', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your specialization" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALIZATIONS.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience *</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee">Consultation Fee (₹) *</Label>
              <Input
                id="fee"
                type="number"
                min="0"
                value={formData.consultation_fee}
                onChange={(e) => handleInputChange('consultation_fee', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Description</Label>
            <Textarea
              id="bio"
              placeholder="Tell patients about your experience, approach, and specialties..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : (doctorData ? 'Update Profile' : 'Create Profile')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}