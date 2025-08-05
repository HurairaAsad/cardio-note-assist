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
import { ReportsDataTable } from '@/components/ReportsDataTable';
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

            {/* Enhanced Reports Management */}
            <ReportsDataTable 
              reports={reports.map(report => ({
                ...report,
                status: 'success' as const,
                processing_time: Math.random() * 5 + 1,
                file_size: Math.floor(Math.random() * 500 + 100) * 1024,
                is_favorited: Math.random() > 0.7,
                is_archived: false,
                tags: Math.random() > 0.5 ? ['urgent', 'follow-up'].slice(0, Math.floor(Math.random() * 2) + 1) : [],
                content_preview: `Clinical summary for ${report.title.toLowerCase()}...`
              }))}
              onViewReport={handleViewReport}
              onDeleteReports={(reportIds) => {
                console.log('Deleting reports:', reportIds);
                // Implement actual delete functionality
              }}
              onExportReports={(reportIds, format) => {
                console.log('Exporting reports:', reportIds, 'as', format);
                // Implement actual export functionality
              }}
              onToggleFavorite={(reportId) => {
                console.log('Toggling favorite for report:', reportId);
                // Implement actual favorite toggle functionality
              }}
              onArchiveReports={(reportIds) => {
                console.log('Archiving reports:', reportIds);
                // Implement actual archive functionality
              }}
              isLoading={loading}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}