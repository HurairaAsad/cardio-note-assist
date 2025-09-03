import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Plus, Search, FileText, Calendar, Stethoscope, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

interface EncountersListProps {
  patientId: string;
}

export function EncountersList({ patientId }: EncountersListProps) {
  const { user } = useAuth();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && patientId) {
      fetchEncounters();
    }
  }, [user, patientId]);

  const fetchEncounters = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_encounters')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user?.id)
        .order('encounter_date', { ascending: false });
      
      if (error) throw error;
      setEncounters(data || []);
    } catch (error) {
      console.error('Error fetching encounters:', error);
      toast.error('Failed to load encounters');
    } finally {
      setLoading(false);
    }
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

  const filteredEncounters = encounters.filter(encounter =>
    encounter.encounter_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    encounter.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    encounter.facility?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    encounter.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingSkeleton variant="table" count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Encounters</h3>
          <p className="text-sm text-muted-foreground">
            Patient encounter history and visit notes
          </p>
        </div>
        <Button 
          onClick={() => navigate(`/patients/${patientId}/encounters/new`)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Encounter
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search encounters by type, provider, facility, or notes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Encounters List */}
      {filteredEncounters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No encounters found' : 'No encounters yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery 
                ? 'No encounters match your search criteria.'
                : 'Start documenting patient encounters to track visit history.'
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => navigate(`/patients/${patientId}/encounters/new`)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Encounter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEncounters.map((encounter) => (
            <Card 
              key={encounter.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/patients/${patientId}/encounters/${encounter.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {format(new Date(encounter.encounter_date), 'MMM dd, yyyy')}
                      </CardTitle>
                      <Badge variant={getEncounterTypeVariant(encounter.encounter_type)}>
                        {getEncounterTypeLabel(encounter.encounter_type)}
                      </Badge>
                    </div>
                    {encounter.cpt_code && (
                      <CardDescription>
                        CPT Code: {encounter.cpt_code}
                      </CardDescription>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(encounter.created_at), 'MMM dd')}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {encounter.provider && (
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Provider:</span>
                      <span>{encounter.provider}</span>
                    </div>
                  )}
                  
                  {encounter.facility && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Facility:</span>
                      <span>{encounter.facility}</span>
                    </div>
                  )}
                </div>
                
                {encounter.notes && (
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-2">
                      {encounter.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/patients/${patientId}/encounters/${encounter.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}