import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ArrowLeft, Edit, FileText, User, Calendar, MapPin, Stethoscope, Hash } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { toast } from 'sonner';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  prn_mrn?: string;
}

interface Encounter {
  id: string;
  patient_id: string;
  encounter_type?: string;
  encounter_date: string;
  provider?: string;
  facility?: string;
  cpt_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function EncounterDetails() {
  const { user, loading: authLoading } = useAuth();
  const { patientId, encounterId } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user && patientId && encounterId) {
      fetchData();
    }
  }, [user, authLoading, navigate, patientId, encounterId]);

  const fetchData = async () => {
    try {
      // Fetch patient and encounter data in parallel
      const [patientResponse, encounterResponse] = await Promise.all([
        supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .eq('user_id', user?.id)
          .single(),
        supabase
          .from('patient_encounters')
          .select('*')
          .eq('id', encounterId)
          .eq('patient_id', patientId)
          .eq('user_id', user?.id)
          .single()
      ]);
      
      if (patientResponse.error) throw patientResponse.error;
      if (encounterResponse.error) throw encounterResponse.error;
      
      setPatient(patientResponse.data);
      setEncounter(encounterResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load encounter details');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const getEncounterTypeLabel = (type?: string) => {
    const types: Record<string, string> = {
      office_visit: 'Office Visit',
      telemedicine: 'Telemedicine',
      follow_up: 'Follow-up',
      consultation: 'Consultation',
      procedure: 'Procedure',
      emergency: 'Emergency',
      routine_checkup: 'Routine Checkup',
      specialist_referral: 'Specialist Referral'
    };
    return types[type || ''] || type || 'Unknown';
  };

  const getEncounterTypeVariant = (type?: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      emergency: 'destructive',
      procedure: 'secondary',
      consultation: 'outline',
      follow_up: 'secondary'
    };
    return variants[type || ''] || 'default';
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

  if (!patient || !encounter) {
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
                  <h3 className="text-lg font-semibold mb-2">Encounter Not Found</h3>
                  <p className="text-muted-foreground mb-4">
                    The encounter details could not be loaded.
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
            <div className="flex items-center justify-between">
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
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Encounter Details</h1>
                  <p className="text-muted-foreground">
                    {format(new Date(encounter.encounter_date), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate(`/patients/${patient.id}/encounters/${encounter.id}/edit`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Encounter
              </Button>
            </div>

            {/* Patient Info Card */}
            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        {patient.prn_mrn && <span>MRN: {patient.prn_mrn}</span>}
                        {patient.date_of_birth && (
                          <span>Age: {getAge(patient.date_of_birth)}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getEncounterTypeVariant(encounter.encounter_type)}>
                    {getEncounterTypeLabel(encounter.encounter_type)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Encounter Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Encounter Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Encounter Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Date</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(encounter.encounter_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>

                      {encounter.provider && (
                        <div className="flex items-center gap-3">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Provider</p>
                            <p className="text-sm text-muted-foreground">{encounter.provider}</p>
                          </div>
                        </div>
                      )}

                      {encounter.facility && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Facility</p>
                            <p className="text-sm text-muted-foreground">{encounter.facility}</p>
                          </div>
                        </div>
                      )}

                      {encounter.cpt_code && (
                        <div className="flex items-center gap-3">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">CPT Code</p>
                            <p className="text-sm text-muted-foreground">{encounter.cpt_code}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Encounter Notes */}
                {encounter.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Encounter Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {encounter.notes}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Encounter Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Created</p>
                      <p className="text-sm">{format(new Date(encounter.created_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm">{format(new Date(encounter.updated_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Encounter ID</p>
                      <p className="text-sm font-mono text-xs">{encounter.id}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate(`/patients/${patient.id}/encounters/new`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      New Encounter
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Patient Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}