import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export function BillingSummaryWidget() {
  // Mock data - in real app this would come from your billing service
  const billingData = {
    currentPlan: "Professional",
    documentsUsed: 180,
    documentsLimit: 250,
    monthlySpend: 49,
    nextBilling: "Jan 15",
    paymentMethod: "•••• 4242"
  };

  const usagePercentage = (billingData.documentsUsed / billingData.documentsLimit) * 100;
  const isNearLimit = usagePercentage >= 80;

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing Summary
          </CardTitle>
          <CardDescription>
            Current usage and billing information
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/billing">View Details</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Current Plan */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Current Plan</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{billingData.currentPlan}</span>
              <Badge variant="secondary">${billingData.monthlySpend}/mo</Badge>
            </div>
            <div className="text-xs text-muted-foreground">Next billing: {billingData.nextBilling}</div>
          </div>

          {/* Usage */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Documents Usage</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{billingData.documentsUsed} / {billingData.documentsLimit}</span>
                <span className="text-muted-foreground">{Math.round(usagePercentage)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
            {isNearLimit && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <AlertTriangle className="w-3 h-3" />
                Approaching limit
              </div>
            )}
          </div>

          {/* Monthly Spend */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">This Month</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">${billingData.monthlySpend}</span>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                +12%
              </div>
            </div>
            <div className="text-xs text-muted-foreground">vs last month</div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Payment Method</div>
            <div className="text-lg font-semibold">{billingData.paymentMethod}</div>
            <Button variant="outline" size="sm" className="w-full">
              Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}