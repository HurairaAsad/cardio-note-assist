import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Copy, Download, Edit3, Save, X, FileText, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ReportData {
  id: string;
  title: string;
  template_type: string;
  created_at: string;
  original_document_name?: string;
  initial_analysis?: string;
  final_report: string;
  review_of_systems?: any;
  physical_exam?: any;
  visit_notes?: any;
}

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedReport, setEditedReport] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (id) {
      fetchReport();
    }
  }, [id, user, navigate]);

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      setReport(data);
      setEditedReport(data.final_report || '');
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    
    try {
      const { error } = await supabase
        .from('reports')
        .update({ final_report: editedReport })
        .eq('id', report.id);
      
      if (error) throw error;
      
      setReport({ ...report, final_report: editedReport });
      setEditing(false);
      toast.success('Report updated successfully');
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report?.final_report || '');
      toast.success('Report copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    if (!report) return;
    
    const blob = new Blob([report.final_report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Report not found</h1>
          <p className="text-muted-foreground mb-4">The requested report could not be found.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            {editing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditing(false);
                  setEditedReport(report.final_report || '');
                }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Report Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{report.title}</CardTitle>
              <Badge variant="secondary">{report.template_type}</Badge>
            </div>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </span>
              {report.original_document_name && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {report.original_document_name}
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Report Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Clinical Report
            </CardTitle>
            <CardDescription>
              {editing ? 'Edit the clinical report below' : 'Review the generated clinical report'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={editedReport}
                onChange={(e) => setEditedReport(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
                placeholder="Edit clinical report..."
              />
            ) : (
              <div className="bg-muted rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                  {report.final_report}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Data Sections */}
        {(report.review_of_systems || report.physical_exam || report.visit_notes) && (
          <div className="mt-6 grid gap-6">
            {report.review_of_systems && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review of Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(report.review_of_systems).map(([system, symptoms]) => (
                      <div key={system} className="border rounded-lg p-4">
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
                          {system.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {typeof symptoms === 'object' && symptoms && Object.entries(symptoms).map(([symptom, value]) => (
                            <div key={symptom} className="flex items-center justify-between text-sm">
                              <span className="text-foreground capitalize">
                                {symptom.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                              </span>
                              <Badge variant={value ? "destructive" : "secondary"} className="text-xs">
                                {value ? "Yes" : "No"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {report.physical_exam && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Physical Exam</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(report.physical_exam).map(([system, findings]) => (
                      <div key={system} className="border rounded-lg p-4">
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
                          {system.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {typeof findings === 'object' && findings && Object.entries(findings).map(([finding, value]) => (
                            <div key={finding} className="flex items-center justify-between text-sm">
                              <span className="text-foreground capitalize">
                                {finding.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                              </span>
                              <Badge variant={value ? "destructive" : "secondary"} className="text-xs">
                                {value ? "Yes" : "No"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {report.visit_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visit Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(report.visit_notes) ? (
                      report.visit_notes.map((visit, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          {typeof visit === 'object' && visit.date && visit.note ? (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {visit.date}
                                </Badge>
                              </div>
                              <div className="text-sm text-foreground">
                                {visit.note}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-foreground whitespace-pre-wrap">
                              {typeof visit === 'string' ? visit : JSON.stringify(visit, null, 2)}
                            </div>
                          )}
                        </div>
                      ))
                    ) : typeof report.visit_notes === 'object' ? (
                      Object.entries(report.visit_notes).map(([key, value]) => (
                        <div key={key} className="border rounded-lg p-4">
                          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                          </h4>
                          <div className="text-sm text-foreground whitespace-pre-wrap">
                            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-foreground whitespace-pre-wrap">
                        {report.visit_notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}