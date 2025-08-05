import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Target,
  Users
} from "lucide-react";
import { formatDistanceToNow, subDays, isAfter } from "date-fns";

interface Report {
  id: string;
  title: string;
  template_type: string;
  created_at: string;
  original_document_name?: string;
}

interface MetricCardsProps {
  reports: Report[];
}

export function MetricCards({ reports }: MetricCardsProps) {
  // Calculate metrics
  const totalReports = reports.length;
  
  const thisMonth = reports.filter(r => 
    new Date(r.created_at).getMonth() === new Date().getMonth() &&
    new Date(r.created_at).getFullYear() === new Date().getFullYear()
  ).length;
  
  const lastMonth = reports.filter(r => {
    const reportDate = new Date(r.created_at);
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    return reportDate.getMonth() === lastMonthDate.getMonth() &&
           reportDate.getFullYear() === lastMonthDate.getFullYear();
  }).length;
  
  const thisWeek = reports.filter(r => 
    isAfter(new Date(r.created_at), subDays(new Date(), 7))
  ).length;
  
  const lastWeek = reports.filter(r => {
    const reportDate = new Date(r.created_at);
    const weekAgo = subDays(new Date(), 7);
    const twoWeeksAgo = subDays(new Date(), 14);
    return isAfter(reportDate, twoWeeksAgo) && !isAfter(reportDate, weekAgo);
  }).length;
  
  const latestReport = reports.length > 0 ? reports[0] : null;
  
  // Calculate trends
  const monthlyTrend = lastMonth === 0 ? 100 : ((thisMonth - lastMonth) / lastMonth) * 100;
  const weeklyTrend = lastWeek === 0 ? 100 : ((thisWeek - lastWeek) / lastWeek) * 100;
  
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Activity className="h-3 w-3 text-muted-foreground" />;
  };
  
  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const metrics = [
    {
      title: "Total Reports",
      value: totalReports.toString(),
      description: "Clinical notes generated",
      icon: FileText,
      trend: null,
      trendText: null
    },
    {
      title: "This Month",
      value: thisMonth.toString(),
      description: "Reports this month",
      icon: Calendar,
      trend: monthlyTrend,
      trendText: `${Math.abs(monthlyTrend).toFixed(0)}% from last month`
    },
    {
      title: "This Week",
      value: thisWeek.toString(),
      description: "Reports this week",
      icon: Target,
      trend: weeklyTrend,
      trendText: `${Math.abs(weeklyTrend).toFixed(0)}% from last week`
    },
    {
      title: "Latest Activity",
      value: latestReport ? formatDistanceToNow(new Date(latestReport.created_at), { addSuffix: true }) : "No activity",
      description: "Last report generated",
      icon: Clock,
      trend: null,
      trendText: null
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
              {metric.trend !== null && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
                    {metric.trendText}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}