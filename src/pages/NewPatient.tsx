import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Save, ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';

interface NewPatientForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  prn_mrn: string;
  facility: string;
  mr_source: string;
  provider: string;
}

export default function NewPatient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewPatientForm>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    prn_mrn: '',
    facility: '',
    mr_source: '',
    provider: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create patients');
      return;
    }

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          ...formData,
          user_id: user.id,
          date_of_birth: formData.date_of_birth || null,
          prn_mrn: formData.prn_mrn || null,
          facility: formData.facility || null,
          mr_source: formData.mr_source || null,
          provider: formData.provider || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Patient created successfully');
      navigate(`/patients/${data.id}`);
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader 
            onNewReport={() => navigate('/')}
            onSearch={(query) => console.log('Search:', query)}
          />
          
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/patients')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Patients
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Add New Patient</h1>
                <p className="text-muted-foreground">
                  Create a new patient profile to manage their medical records
                </p>
              </div>
            </div>

            {/* Form */}
            <Card className="max-w-2xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Patient Information</CardTitle>
                </div>
                <CardDescription>
                  Enter the basic information for the new patient. Required fields are marked with an asterisk.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last_name">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="prn_mrn">Patient Record Number (PRN/MRN)</Label>
                      <Input
                        id="prn_mrn"
                        name="prn_mrn"
                        value={formData.prn_mrn}
                        onChange={handleChange}
                        placeholder="Enter PRN or MRN"
                      />
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facility">Facility</Label>
                      <Input
                        id="facility"
                        name="facility"
                        value={formData.facility}
                        onChange={handleChange}
                        placeholder="Enter facility name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mr_source">Medical Record Source</Label>
                      <Input
                        id="mr_source"
                        name="mr_source"
                        value={formData.mr_source}
                        onChange={handleChange}
                        placeholder="Enter MR source"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      name="provider"
                      value={formData.provider}
                      onChange={handleChange}
                      placeholder="Enter provider name"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/patients')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                      {loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Create Patient
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}