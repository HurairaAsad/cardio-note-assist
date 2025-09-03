import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ArrowLeft, Save, FileText, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  prn_mrn?: string;
}

export default function NewEncounter() {
  const { user, loading: authLoading } = useAuth();
  const { patientId } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [encounterData, setEncounterData] = useState({
    encounter_type: '',
    encounter_date: format(new Date(), 'yyyy-MM-dd'),
    provider: '',
    facility: '',
    cpt_code: '',
    notes: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user && patientId) {
      fetchPatient();
    }
  }, [user, authLoading, navigate, patientId]);

  const fetchPatient = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient information');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('patient_encounters')
        .insert({
          patient_id: patient.id,
          user_id: user.id,
          ...encounterData
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Encounter created successfully');
      navigate(`/patients/${patient.id}/encounters/${data.id}`);
    } catch (error) {
      console.error('Error creating encounter:', error);
      toast.error('Failed to create encounter');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setEncounterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (authLoading || loading) {
    return (
      <SidebarProvider defaultOpen>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex flex-col flex-1">
            <DashboardHeader 
              onNewReport={() => navigate('/')}
              onSearch={(query) => console.log('Search:', query)}
            />
            <main className="flex-1 p-6 space-y-6">
              <LoadingSkeleton variant="card" />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!patient) {
    return (
      <SidebarProvider defaultOpen>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex flex-col flex-1">
            <DashboardHeader 
              onNewReport={() => navigate('/')}
              onSearch={(query) => console.log('Search:', query)}
            />
            <main className="flex-1 p-6">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Patient Not Found</h3>
                  <p className="text-muted-foreground mb-4">
                    The patient information could not be loaded.
                  </p>
                  <Button onClick={() => navigate('/patients')} variant="outline">
                    Back to Patients
                  </Button>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

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
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight">New Encounter</h1>
                <p className="text-muted-foreground">
                  Create a new encounter for {patient.first_name} {patient.last_name}
                </p>
              </div>
            </div>

            {/* Patient Info Card */}
            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {patient.first_name} {patient.last_name}
                    </CardTitle>
                    <CardDescription>
                      {patient.prn_mrn && `MRN: ${patient.prn_mrn}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Encounter Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Encounter Details
                  </CardTitle>
                  <CardDescription>
                    Fill in the details for this patient encounter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="encounter_type">Encounter Type *</Label>
                      <Select 
                        value={encounterData.encounter_type}
                        onValueChange={(value) => handleChange('encounter_type', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select encounter type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office_visit">Office Visit</SelectItem>
                          <SelectItem value="telemedicine">Telemedicine</SelectItem>
                          <SelectItem value="follow_up">Follow-up</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="procedure">Procedure</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                          <SelectItem value="specialist_referral">Specialist Referral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="encounter_date">Encounter Date *</Label>
                      <Input
                        id="encounter_date"
                        type="date"
                        value={encounterData.encounter_date}
                        onChange={(e) => handleChange('encounter_date', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider</Label>
                      <Input
                        id="provider"
                        value={encounterData.provider}
                        onChange={(e) => handleChange('provider', e.target.value)}
                        placeholder="Provider name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facility">Facility</Label>
                      <Input
                        id="facility"
                        value={encounterData.facility}
                        onChange={(e) => handleChange('facility', e.target.value)}
                        placeholder="Facility name"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="cpt_code">CPT Code</Label>
                      <Input
                        id="cpt_code"
                        value={encounterData.cpt_code}
                        onChange={(e) => handleChange('cpt_code', e.target.value)}
                        placeholder="e.g., 99213"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Encounter Notes</Label>
                    <Textarea
                      id="notes"
                      value={encounterData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Document your encounter findings, treatment plan, and any relevant notes..."
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !encounterData.encounter_type}>
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Encounter
                    </>
                  )}
                </Button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}