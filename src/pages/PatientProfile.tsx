import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Heart, 
  Activity, 
  Pill, 
  Stethoscope, 
  Users,
  Plus,
  Edit,
  History,
  CreditCard,
  Shield,
  CalendarDays
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { toast } from 'sonner';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  prn_mrn?: string;
  facility?: string;
  mr_source?: string;
  provider?: string;
  created_at: string;
  updated_at: string;
}

interface PatientEncounter {
  id: string;
  encounter_date: string;
  cpt_code?: string;
  provider?: string;
  facility?: string;
  encounter_type?: string;
  notes?: string;
}

interface PatientDiagnosis {
  id: string;
  icd_code: string;
  diagnosis_name: string;
  category?: string;
  is_active: boolean;
  diagnosed_date?: string;
}

interface PatientMedication {
  id: string;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  category?: string;
  is_active: boolean;
  started_date?: string;
}

interface PatientProcedure {
  id: string;
  procedure_name: string;
  procedure_date?: string;
  facility?: string;
  provider?: string;
}

interface CareTeamMember {
  id: string;
  provider_type: string;
  provider_name?: string;
  contact_info?: string;
  is_active: boolean;
}

export default function PatientProfile() {
  const { patientId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounters, setEncounters] = useState<PatientEncounter[]>([]);
  const [diagnoses, setDiagnoses] = useState<PatientDiagnosis[]>([]);
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [procedures, setProcedures] = useState<PatientProcedure[]>([]);
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user && patientId) {
      fetchPatientData();
    }
  }, [user, authLoading, patientId, navigate]);

  const fetchPatientData = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      
      // Fetch patient info
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .eq('user_id', user?.id)
        .single();
      
      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch encounters
      const { data: encountersData } = await supabase
        .from('patient_encounters')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user?.id)
        .order('encounter_date', { ascending: false });
      
      setEncounters(encountersData || []);

      // Fetch diagnoses
      const { data: diagnosesData } = await supabase
        .from('patient_diagnoses')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user?.id)
        .order('diagnosed_date', { ascending: false });
      
      setDiagnoses(diagnosesData || []);

      // Fetch medications
      const { data: medicationsData } = await supabase
        .from('patient_medications')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user?.id)
        .order('started_date', { ascending: false });
      
      setMedications(medicationsData || []);

      // Fetch procedures
      const { data: proceduresData } = await supabase
        .from('patient_procedures')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user?.id)
        .order('procedure_date', { ascending: false });
      
      setProcedures(proceduresData || []);

      // Fetch care team
      const { data: careTeamData } = await supabase
        .from('patient_care_team')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user?.id)
        .eq('is_active', true);
      
      setCareTeam(careTeamData || []);

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const handleNewEncounter = () => {
    navigate(`/patients/${patientId}/encounter`);
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
              <LoadingSkeleton variant="metrics" />
              <LoadingSkeleton variant="chart" count={2} />
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
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Patient not found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    The patient you're looking for doesn't exist or you don't have access to it.
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
            {/* Patient Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-2xl">
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                      <Badge variant="secondary">
                        Age {getAge(patient.date_of_birth)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">DOB: </span>
                        {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">MRN: </span>
                        {patient.prn_mrn || 'N/A'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Facility: </span>
                        {patient.facility || 'N/A'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">MR Source: </span>
                        {patient.mr_source || 'N/A'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Provider: </span>
                        {patient.provider || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button onClick={handleNewEncounter} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Start New Encounter
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Patient Profile Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="encounters" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing Hx
                </TabsTrigger>
                <TabsTrigger value="insurance" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Insurance
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-2">
                  <History className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="encounter" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Encounter
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Note History */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Note History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {encounters.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No encounters recorded</p>
                      ) : (
                        encounters.slice(0, 5).map((encounter) => (
                          <div key={encounter.id} className="text-sm border-l-2 border-muted pl-3">
                            <div className="font-medium">
                              {encounter.encounter_date && format(new Date(encounter.encounter_date), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-muted-foreground">
                              {encounter.cpt_code}, {encounter.provider}, {encounter.facility}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Diagnoses */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Diagnoses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Cardiac Diagnoses */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Cardiac:</h4>
                        <div className="space-y-2">
                          {diagnoses
                            .filter(d => d.category === 'cardiac' && d.is_active)
                            .map((diagnosis) => (
                              <div key={diagnosis.id} className="text-sm">
                                <span className="font-medium">{diagnosis.icd_code}</span>: {diagnosis.diagnosis_name}
                              </div>
                            ))
                          }
                          {diagnoses.filter(d => d.category === 'cardiac' && d.is_active).length === 0 && (
                            <p className="text-xs text-muted-foreground">No cardiac diagnoses</p>
                          )}
                        </div>
                      </div>

                      {/* Non-Cardiac Diagnoses */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Non-Cardiac:</h4>
                        <div className="space-y-2">
                          {diagnoses
                            .filter(d => d.category === 'non-cardiac' && d.is_active)
                            .map((diagnosis) => (
                              <div key={diagnosis.id} className="text-sm">
                                <span className="font-medium">{diagnosis.icd_code}</span>: {diagnosis.diagnosis_name}
                              </div>
                            ))
                          }
                          {diagnoses.filter(d => d.category === 'non-cardiac' && d.is_active).length === 0 && (
                            <p className="text-xs text-muted-foreground">No non-cardiac diagnoses</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medications */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Medications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Cardiac Medications */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Cardiac:</h4>
                        <div className="space-y-2">
                          {medications
                            .filter(m => m.category === 'cardiac' && m.is_active)
                            .map((medication) => (
                              <div key={medication.id} className="text-sm">
                                <div className="font-medium">{medication.medication_name}</div>
                                <div className="text-muted-foreground">
                                  {medication.dosage} {medication.frequency}
                                </div>
                              </div>
                            ))
                          }
                          {medications.filter(m => m.category === 'cardiac' && m.is_active).length === 0 && (
                            <p className="text-xs text-muted-foreground">No cardiac medications</p>
                          )}
                        </div>
                      </div>

                      {/* Non-Cardiac Medications */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Non-Cardiac Meds:</h4>
                        <div className="space-y-2">
                          {medications
                            .filter(m => m.category === 'non-cardiac' && m.is_active)
                            .map((medication) => (
                              <div key={medication.id} className="text-sm">
                                <div className="font-medium">{medication.medication_name}</div>
                                <div className="text-muted-foreground">
                                  {medication.dosage} {medication.frequency}
                                </div>
                              </div>
                            ))
                          }
                          {medications.filter(m => m.category === 'non-cardiac' && m.is_active).length === 0 && (
                            <p className="text-xs text-muted-foreground">No non-cardiac medications</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Procedures */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Procedures
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {procedures.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No procedures recorded</p>
                      ) : (
                        procedures.slice(0, 5).map((procedure) => (
                          <div key={procedure.id} className="text-sm">
                            <div className="font-medium">{procedure.procedure_name}</div>
                            <div className="text-muted-foreground">
                              {procedure.procedure_date && format(new Date(procedure.procedure_date), 'yyyy')}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Care Team */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Care Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {careTeam.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No care team members assigned</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {careTeam.map((member) => (
                            <div key={member.id} className="text-sm">
                              <div className="font-medium capitalize">
                                {member.provider_type.replace('_', ' ')}:
                              </div>
                              <div className="text-muted-foreground">
                                {member.provider_name || 'Not assigned'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="encounters">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents & Encounters</CardTitle>
                    <CardDescription>
                      View and manage patient encounter documents and notes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Document management interface coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>
                      Track patient billing and payment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Billing history interface coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insurance">
                <Card>
                  <CardHeader>
                    <CardTitle>Insurance Information</CardTitle>
                    <CardDescription>
                      Manage patient insurance details and coverage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Insurance management interface coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Timeline</CardTitle>
                    <CardDescription>
                      Chronological view of all patient interactions and events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Timeline interface coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="encounter">
                <Card>
                  <CardHeader>
                    <CardTitle>Start New Encounter</CardTitle>
                    <CardDescription>
                      Create a new patient encounter or follow-up visit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleNewEncounter} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Start New Encounter
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}