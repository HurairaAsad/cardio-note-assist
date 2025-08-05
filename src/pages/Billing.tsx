import { useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Download,
  Settings,
  Plus,
  Check,
  Zap,
  Crown,
  Star
} from "lucide-react";

const Billing = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mock billing data
  const currentPlan = {
    name: "Professional",
    price: 49,
    documents: { used: 180, limit: 250 },
    apiCalls: { used: 2150, limit: 3000 },
    storage: { used: 2.3, limit: 5 },
    nextBilling: "2024-01-15"
  };

  const paymentHistory = [
    { id: 1, date: "2023-12-15", amount: 49, status: "Paid", invoice: "INV-001" },
    { id: 2, date: "2023-11-15", amount: 49, status: "Paid", invoice: "INV-002" },
    { id: 3, date: "2023-10-15", amount: 49, status: "Paid", invoice: "INV-003" },
  ];

  const plans = [
    {
      name: "Basic",
      price: 19,
      features: ["100 documents/month", "1,000 API calls", "2GB storage", "Email support"],
      popular: false,
      icon: Zap
    },
    {
      name: "Professional",
      price: 49,
      features: ["250 documents/month", "3,000 API calls", "5GB storage", "Priority support", "Advanced analytics"],
      popular: true,
      icon: Crown
    },
    {
      name: "Enterprise",
      price: 99,
      features: ["Unlimited documents", "10,000 API calls", "20GB storage", "24/7 support", "Custom integrations"],
      popular: false,
      icon: Star
    }
  ];

  const getUsagePercentage = (used: number, limit: number) => (used / limit) * 100;
  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-orange-500";
    return "bg-primary";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Billing & Usage</h1>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="plans">Plans</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Billing Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                      <Crown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{currentPlan.name}</div>
                      <p className="text-xs text-muted-foreground">
                        ${currentPlan.price}/month
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Upgrade Plan
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Jan 15</div>
                      <p className="text-xs text-muted-foreground">
                        ${currentPlan.price} will be charged
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${currentPlan.price}</div>
                      <p className="text-xs text-muted-foreground">
                        +12% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">•••• 4242</div>
                      <p className="text-xs text-muted-foreground">
                        Expires 12/25
                      </p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => setShowPaymentModal(true)}>
                        Update
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Usage Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Summary</CardTitle>
                    <CardDescription>Your current usage across all services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Documents Processed</span>
                        <span className="text-sm text-muted-foreground">
                          {currentPlan.documents.used} / {currentPlan.documents.limit}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(currentPlan.documents.used, currentPlan.documents.limit)} 
                        className="h-2"
                      />
                      {getUsagePercentage(currentPlan.documents.used, currentPlan.documents.limit) >= 80 && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <AlertTriangle className="w-4 h-4" />
                          You're approaching your document limit
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">API Calls</span>
                        <span className="text-sm text-muted-foreground">
                          {currentPlan.apiCalls.used} / {currentPlan.apiCalls.limit}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(currentPlan.apiCalls.used, currentPlan.apiCalls.limit)} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Storage Used</span>
                        <span className="text-sm text-muted-foreground">
                          {currentPlan.storage.used}GB / {currentPlan.storage.limit}GB
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(currentPlan.storage.used, currentPlan.storage.limit)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usage" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Usage Analytics</CardTitle>
                    <CardDescription>Track your usage patterns and optimize costs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Usage analytics charts will be displayed here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Payment History</CardTitle>
                      <CardDescription>View and download your payment history</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Payment Settings
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Invoice</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>${payment.amount}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                <Check className="w-3 h-3 mr-1" />
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{payment.invoice}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="plans" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <Card key={plan.name} className={plan.popular ? "border-primary" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <plan.icon className="w-5 h-5" />
                            {plan.name}
                          </CardTitle>
                          {plan.popular && (
                            <Badge variant="default">Current Plan</Badge>
                          )}
                        </div>
                        <CardDescription>
                          <span className="text-3xl font-bold">${plan.price}</span>/month
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full" 
                          variant={plan.popular ? "default" : "outline"}
                          disabled={plan.popular}
                        >
                          {plan.popular ? "Current Plan" : "Upgrade"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Payment Method Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Method</DialogTitle>
            <DialogDescription>
              Add or update your payment method for future billing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Payment method form will be implemented here
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button>Save Payment Method</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Billing;