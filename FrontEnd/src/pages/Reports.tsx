import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  MapPin,
  Users,
  Truck,
  FileText
} from "lucide-react";

const Reports = () => {
  const reportCategories = [
    {
      title: "Sales Reports",
      description: "Revenue and sales volume analysis",
      icon: TrendingUp,
      reports: [
        { name: "Quarterly Sales Report", description: "Value and volume breakdown by quarter", lastGenerated: "2024-08-01" },
        { name: "Most Ordered Items", description: "Top selling products in given quarter", lastGenerated: "2024-08-01" },
        { name: "City-wise Sales", description: "Sales breakdown by destination city", lastGenerated: "2024-08-05" },
        { name: "Route-wise Sales", description: "Performance analysis by delivery route", lastGenerated: "2024-08-03" }
      ]
    },
    {
      title: "Operations Reports",
      description: "Logistics and operational metrics",
      icon: Package,
      reports: [
        { name: "Customer Order History", description: "Complete delivery history per customer", lastGenerated: "2024-08-06" },
        { name: "Truck Usage Analysis", description: "Monthly vehicle utilization report", lastGenerated: "2024-08-01" },
        { name: "Train Capacity Report", description: "Railway transport efficiency analysis", lastGenerated: "2024-08-04" },
        { name: "Delivery Performance", description: "On-time delivery and route efficiency", lastGenerated: "2024-08-07" }
      ]
    },
    {
      title: "HR Reports",
      description: "Workforce and staffing analytics",
      icon: Users,
      reports: [
        { name: "Driver Working Hours", description: "Weekly and monthly hour tracking", lastGenerated: "2024-08-07" },
        { name: "Assistant Utilization", description: "Assistant workload and efficiency", lastGenerated: "2024-08-07" },
        { name: "Staff Performance", description: "Employee ratings and delivery metrics", lastGenerated: "2024-08-05" },
        { name: "Roster Compliance", description: "Work hour regulation compliance", lastGenerated: "2024-08-06" }
      ]
    }
  ];

  const quickStats = [
    { label: "This Quarter Revenue", value: "Rs. 24.8M", change: "+12.5%", trend: "up" },
    { label: "Orders Delivered", value: "1,247", change: "+8.3%", trend: "up" },
    { label: "Average Delivery Time", value: "4.2 hrs", change: "-0.8 hrs", trend: "down" },
    { label: "Customer Satisfaction", value: "94.7%", change: "+2.1%", trend: "up" }
  ];

  const recentReports = [
    { name: "Daily Operations Summary", date: "2024-08-07", size: "2.4 MB", format: "PDF" },
    { name: "Weekly Sales Dashboard", date: "2024-08-05", size: "1.8 MB", format: "XLSX" },
    { name: "Driver Performance Report", date: "2024-08-03", size: "945 KB", format: "PDF" },
    { name: "Route Efficiency Analysis", date: "2024-08-01", size: "3.2 MB", format: "PDF" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business intelligence and operational insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Report
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Categories */}
      <div className="space-y-6">
        {reportCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.reports.map((report, reportIndex) => (
                    <div key={reportIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{report.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          Available
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {report.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Last: {report.lastGenerated}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button size="sm" className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            Generate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Reports
          </CardTitle>
          <CardDescription>Recently generated reports and downloads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.date} • {report.size} • {report.format}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key operational indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">On-time Delivery Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "94%" }}></div>
                  </div>
                  <span className="text-sm font-medium">94%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Train Capacity Utilization</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "87%" }}></div>
                  </div>
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fleet Efficiency</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Satisfaction</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                  <span className="text-sm font-medium">95%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Routes</CardTitle>
            <CardDescription>Routes with highest efficiency this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { route: "R-01 - Colombo Central", orders: 145, efficiency: "96%" },
                { route: "R-04 - Kandy Hills", orders: 89, efficiency: "94%" },
                { route: "R-02 - Negombo Coast", orders: 76, efficiency: "92%" },
                { route: "R-05 - Matara Deep South", orders: 68, efficiency: "89%" },
                { route: "R-03 - Galle Southern", orders: 101, efficiency: "87%" }
              ].map((route, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{route.route}</p>
                    <p className="text-xs text-muted-foreground">{route.orders} orders</p>
                  </div>
                  <Badge variant="secondary">{route.efficiency}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;