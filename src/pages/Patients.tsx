import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Plus, Search, Users, UserPlus } from 'lucide-react';
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

export default function Patients() {
  const { user, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchPatients();
    }
  }, [user, authLoading, navigate]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPatient = () => {
    navigate('/patients/new');
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.prn_mrn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.facility?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <LoadingSkeleton variant="table" count={5} />
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
                <p className="text-muted-foreground">
                  Manage patient profiles and medical records
                </p>
              </div>
              <Button onClick={handleNewPatient} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Patient
              </Button>
            </div>

            {/* Search and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="md:col-span-3">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search patients by name, MRN, or facility..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{patients.length}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Patients</p>
                </CardContent>
              </Card>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery ? 'No patients match your search criteria.' : 'Start by adding your first patient.'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={handleNewPatient} variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Patient
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredPatients.map((patient) => (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {patient.first_name} {patient.last_name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {patient.prn_mrn && (
                              <span>MRN: {patient.prn_mrn}</span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Age {getAge(patient.date_of_birth)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {patient.date_of_birth && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">DOB: </span>
                          {format(new Date(patient.date_of_birth), 'MMM dd, yyyy')}
                        </div>
                      )}
                      
                      {patient.facility && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Facility: </span>
                          {patient.facility}
                        </div>
                      )}
                      
                      {patient.provider && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Provider: </span>
                          {patient.provider}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Last updated: {format(new Date(patient.updated_at), 'MMM dd, yyyy')}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleViewPatient(patient.id)}
                          className="flex-1"
                        >
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/patients/${patient.id}/encounter`)}
                          className="flex-1"
                        >
                          New Encounter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}