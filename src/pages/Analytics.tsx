import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, 
  Download, FileText, Calendar as CalendarIcon, Filter,
  Activity, Users, Zap, AlertTriangle
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';

// Mock data for analytics
const processingData = [
  { name: 'Mon', success: 45, failed: 3, avg_time: 2.3 },
  { name: 'Tue', success: 52, failed: 1, avg_time: 2.1 },
  { name: 'Wed', success: 48, failed: 4, avg_time: 2.8 },
  { name: 'Thu', success: 61, failed: 2, avg_time: 2.0 },
  { name: 'Fri', success: 55, failed: 1, avg_time: 1.9 },
  { name: 'Sat', success: 32, failed: 0, avg_time: 2.2 },
  { name: 'Sun', success: 28, failed: 1, avg_time: 2.4 },
];

const templateUsage = [
  { name: 'SOAP Notes', value: 45, trend: 12 },
  { name: 'Discharge Summary', value: 28, trend: -3 },
  { name: 'Consultation', value: 18, trend: 8 },
  { name: 'Progress Note', value: 12, trend: 5 },
  { name: 'Other', value: 8, trend: -2 },
];

const userActivity = [
  { hour: '00:00', sessions: 12, avg_duration: 8.5 },
  { hour: '06:00', sessions: 45, avg_duration: 12.3 },
  { hour: '09:00', sessions: 89, avg_duration: 15.7 },
  { hour: '12:00', sessions: 76, avg_duration: 18.2 },
  { hour: '15:00', sessions: 95, avg_duration: 22.1 },
  { hour: '18:00', sessions: 68, avg_duration: 16.8 },
  { hour: '21:00', sessions: 34, avg_duration: 11.4 },
];

const performanceMetrics = [
  { name: 'API Response', current: 98.5, target: 99.0, trend: 'up' },
  { name: 'Processing Speed', current: 2.1, target: 2.0, trend: 'down' },
  { name: 'Error Rate', current: 0.8, target: 1.0, trend: 'up' },
  { name: 'Queue Time', current: 15, target: 10, trend: 'down' },
];

const monthlyComparison = [
  { month: 'Jan', current: 245, previous: 198, documents: 89 },
  { month: 'Feb', current: 289, previous: 234, documents: 102 },
  { month: 'Mar', current: 325, previous: 267, documents: 118 },
  { month: 'Apr', current: 398, previous: 301, documents: 145 },
  { month: 'May', current: 445, previous: 356, documents: 167 },
  { month: 'Jun', current: 502, previous: 412, documents: 189 },
];

const colors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

export default function Analytics() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('7d');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('processing');

  const handleExport = (format: string) => {
    console.log(`Exporting ${activeTab} data as ${format}`);
    // Implementation for export functionality
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader 
            onNewReport={() => {}}
            onSearch={(query) => console.log('Search:', query)}
          />
          
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header with filters and export */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
                <p className="text-muted-foreground">Comprehensive insights into your system performance</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Custom Range
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Button onClick={() => handleExport('pdf')} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Analytics Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="activity">User Activity</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="comparative">Comparative</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              {/* Processing Analytics */}
              <TabsContent value="processing" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                          <p className="text-2xl font-bold text-success">97.2%</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-success" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-success mt-2">
                        <TrendingUp className="w-3 h-3" />
                        +2.3% from last week
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Process Time</p>
                          <p className="text-2xl font-bold">2.1s</p>
                        </div>
                        <Clock className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-success mt-2">
                        <TrendingDown className="w-3 h-3" />
                        -0.3s improvement
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Failed Processes</p>
                          <p className="text-2xl font-bold text-error">12</p>
                        </div>
                        <XCircle className="w-8 h-8 text-error" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-error mt-2">
                        <TrendingUp className="w-3 h-3" />
                        +3 from last week
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Documents Processed</p>
                          <p className="text-2xl font-bold">1,248</p>
                        </div>
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-success mt-2">
                        <TrendingUp className="w-3 h-3" />
                        +145 from last week
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Success vs Failure Rate</CardTitle>
                      <CardDescription>Daily processing outcomes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={processingData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                            <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px"
                              }}
                            />
                            <Legend />
                            <Bar dataKey="success" fill={colors.success} name="Successful" />
                            <Bar dataKey="failed" fill={colors.error} name="Failed" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Template Usage Distribution</CardTitle>
                      <CardDescription>Most popular document templates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={templateUsage}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {templateUsage.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* User Activity Analytics */}
              <TabsContent value="activity" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                          <p className="text-2xl font-bold">1,234</p>
                        </div>
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-success mt-2">
                        <TrendingUp className="w-3 h-3" />
                        +8.2% from last month
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Peak Hour</p>
                          <p className="text-2xl font-bold">3:00 PM</p>
                        </div>
                        <Activity className="w-8 h-8 text-accent" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                        95 sessions
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                          <p className="text-2xl font-bold">16.4 min</p>
                        </div>
                        <Clock className="w-8 h-8 text-secondary" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-success mt-2">
                        <TrendingUp className="w-3 h-3" />
                        +2.1 min longer
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                          <p className="text-2xl font-bold">84.3%</p>
                        </div>
                        <Zap className="w-8 h-8 text-warning" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-success mt-2">
                        <TrendingUp className="w-3 h-3" />
                        +5.7% improvement
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Hourly Activity Patterns</CardTitle>
                    <CardDescription>User sessions and average duration throughout the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userActivity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="hour" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                          <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="sessions"
                            stroke={colors.primary}
                            fill={colors.primary}
                            fillOpacity={0.3}
                            name="Sessions"
                          />
                          <Line
                            type="monotone"
                            dataKey="avg_duration"
                            stroke={colors.accent}
                            strokeWidth={3}
                            name="Avg Duration (min)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Monitoring */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {performanceMetrics.map((metric) => (
                    <Card key={metric.name}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                            <p className="text-2xl font-bold">{metric.current}{metric.name.includes('Rate') ? '%' : metric.name.includes('Time') ? 's' : ''}</p>
                          </div>
                          {metric.trend === 'up' ? (
                            <TrendingUp className="w-8 h-8 text-success" />
                          ) : (
                            <TrendingDown className="w-8 h-8 text-error" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-muted-foreground">Target: {metric.target}{metric.name.includes('Rate') ? '%' : metric.name.includes('Time') ? 's' : ''}</span>
                          <Badge variant={metric.current >= metric.target ? 'default' : 'destructive'}>
                            {metric.current >= metric.target ? 'On Track' : 'Below Target'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health Overview</CardTitle>
                    <CardDescription>Real-time performance monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">CPU Usage</span>
                          <span className="text-sm text-muted-foreground">72%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Memory Usage</span>
                          <span className="text-sm text-muted-foreground">58%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-secondary h-2 rounded-full" style={{ width: '58%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Queue Load</span>
                          <span className="text-sm text-muted-foreground">31%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-accent h-2 rounded-full" style={{ width: '31%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comparative Analytics */}
              <TabsContent value="comparative" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Month-over-Month Growth</CardTitle>
                    <CardDescription>Comparing current vs previous year performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyComparison}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                          <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="current"
                            stroke={colors.primary}
                            strokeWidth={3}
                            name="2024"
                          />
                          <Line
                            type="monotone"
                            dataKey="previous"
                            stroke={colors.secondary}
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            name="2023"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Export & Reporting */}
              <TabsContent value="reports" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Reports</CardTitle>
                      <CardDescription>Generate instant reports</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleExport('pdf')}>
                        <FileText className="w-4 h-4" />
                        Processing Summary PDF
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleExport('csv')}>
                        <Download className="w-4 h-4" />
                        Usage Data CSV
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleExport('excel')}>
                        <FileText className="w-4 h-4" />
                        Performance Report Excel
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Scheduled Reports</CardTitle>
                      <CardDescription>Automated report delivery</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Daily Summary</span>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Weekly Analytics</span>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Monthly Report</span>
                          <Badge variant="outline">Paused</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Manage Schedules
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Reports</CardTitle>
                      <CardDescription>Build your own reports</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full">
                        Report Builder
                      </Button>
                      <Button variant="outline" className="w-full">
                        Template Library
                      </Button>
                      <Button variant="outline" className="w-full">
                        Saved Reports
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}