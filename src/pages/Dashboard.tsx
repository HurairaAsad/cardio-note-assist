import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { MetricCards } from '@/components/MetricCards';
import { BillingSummaryWidget } from '@/components/BillingSummaryWidget';
import { FileText, Plus, Calendar } from 'lucide-react';
import { formatDistanceToNow, format, subDays, eachDayOfInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Report {
  id: string;
  title: string;
  template_type: string;
  created_at: string;
  original_document_name?: string;
}

export default function Dashboard() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchReports();
    }
  }, [user, authLoading, navigate]);

  const fetchReports = async () => {
    try {
      console.log('Fetching reports for user:', user?.id);
      const { data, error } = await supabase
        .from('reports')
        .select('id, title, template_type, created_at, original_document_name')
        .eq('user_id', user?.id) // Add user filter for RLS
        .order('created_at', { ascending: false });
      
      console.log('Reports query result:', { data, error });
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = () => {
    navigate('/');
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/report/${reportId}`);
  };

  // Helper functions for charts
  const getActivityData = () => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(day => {
      const dayReports = reports.filter(report => 
        format(new Date(report.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      return {
        date: format(day, 'MMM dd'),
        reports: dayReports.length
      };
    });
  };

  const getTemplateData = () => {
    const templateCounts: Record<string, number> = {};
    reports.forEach(report => {
      const template = report.template_type || 'Unknown';
      templateCounts[template] = (templateCounts[template] || 0) + 1;
    });

    return Object.entries(templateCounts).map(([name, value]) => ({ name, value }));
  };

  const getTemplateColor = (index: number) => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))', 
      'hsl(var(--accent))',
      'hsl(var(--muted))',
      '#8b5cf6',
      '#06d6a0'
    ];
    return colors[index % colors.length];
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader 
            onNewReport={handleNewReport}
            onSearch={(query) => console.log('Search:', query)}
          />
          
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Enhanced Metric Cards */}
            <MetricCards reports={reports} />

            {/* Billing Summary Widget */}
            <BillingSummaryWidget />

            {/* Analytics Charts */}
            {reports.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Over Time</CardTitle>
                    <CardDescription>Reports generated in the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getActivityData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis 
                            dataKey="date" 
                            fontSize={12} 
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <YAxis 
                            fontSize={12} 
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="reports" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3}
                            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Template Distribution */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Report Types</CardTitle>
                    <CardDescription>Distribution by template type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getTemplateData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {getTemplateData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getTemplateColor(index)} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {getTemplateData().map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: getTemplateColor(index) }}
                          />
                          <span className="truncate">{entry.name}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Reports Section */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Recent Reports</CardTitle>
                    <CardDescription>Your latest clinical note reports</CardDescription>
                  </div>
                  <Button onClick={handleNewReport} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reports yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by creating your first clinical note report
                    </p>
                    <Button onClick={handleNewReport}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Report
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <div 
                        key={report.id} 
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" 
                        onClick={() => handleViewReport(report.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{report.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                              {report.original_document_name && (
                                <>
                                  <span>•</span>
                                  <span>{report.original_document_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{report.template_type}</Badge>
                      </div>
                    ))}
                    {reports.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" onClick={() => navigate('/reports')}>
                          View All Reports ({reports.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}