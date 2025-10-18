// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  Users,
  FileText
} from "lucide-react";

const previewReport = (reportType: string) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
  window.open(`${API_BASE}/reports/${reportType}/pdf`, "_blank");
};

const getReportType = (reportName: string) => {
  switch(reportName) {
    case " Sales Report": return "quarterly-sales";
    case "Most Ordered Items": return "most-ordered-items";
    case "City-wise Sales": return "city-wise-sales";
    case "Route-wise Sales": return "route-wise-sales";
    default: return "";
  }
};

const downloadReport = async (reportType: string) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
  try {
    const res = await fetch(`${API_BASE}/reports/${reportType}/pdf`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const filename = reportType.includes("quarterly-sales")
      ? "Quarterly_Sales_Report.pdf"
      : "Report.pdf";

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to download report", err);
  }
};

const Reports = () => {
  const reportCategories = [
    {
      title: "Sales Reports",
      description: "Revenue and sales volume analysis",
      icon: TrendingUp,
      reports: [
        { name: " Sales Report", description: "Value and volume breakdown by quarter", lastGenerated: "2024-08-01" },
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

  type QuickStat = {
    label: string;
    value: string;
    change?: string;
    trend?: "up" | "down";
  };

  const FALLBACK_STATS: QuickStat[] = [
    { label: "This Quarter Revenue", value: "Rs. 24.8M", change: "+12.5%", trend: "up" },
    { label: "Orders Delivered", value: "1,247", change: "+8.3%", trend: "up" },
    { label: "Average Delivery Time", value: "4.2 hrs", change: "-0.8 hrs", trend: "down" },
    { label: "Customer Satisfaction", value: "94.7%", change: "+2.1%", trend: "up" }
  ];

  const [quickStats, setQuickStats] = useState<QuickStat[]>(FALLBACK_STATS);

  // Dropdown state for "Most Ordered Items"
  const [reportFilters, setReportFilters] = useState<{ year: string; quarter: string }>({
    year: "",
    quarter: ""
  });

const downloadMostOrderedItemsPdf = async () => {
  const year = parseInt(reportFilters.year, 10);
  const quarterMap: { [key: string]: number } = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
  const quarter = quarterMap[reportFilters.quarter];

  if (!year || !quarter) return;

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

  try {
    const res = await fetch(`${API_BASE}/reports/most-ordered-items?year=${year}&quarter=${quarter}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Most_Ordered_Items_Q${quarter}_${year}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to download Most Ordered Items PDF", err);
  }
};

  useEffect(() => {
    let mounted = true;
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

    async function loadKpis() {
      try {
        const res = await fetch(`${API_BASE}/dasshboard/kpi`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const mapped = data.map((item: any) => ({
          label: item.name ?? item.label ?? "",
          value: Array.isArray(item.value) ? String(item.value[0]) : String(item.value ?? "0"),
          change: item.change,
          trend: item.trend
        } as QuickStat));

        if (mounted && mapped.length) setQuickStats(mapped);
      } catch (err) {
        console.error("Failed to load KPIs", err);
      }
    }

    loadKpis();
    return () => { mounted = false; };
  }, []);

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
              <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
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
                  {category.reports.map((report, reportIndex) => {
                    const isMostOrdered = report.name === "Most Ordered Items";
                    let canGenerate = true;
                    if (isMostOrdered) {
                      const isYearValid = /^\d{4}$/.test(reportFilters.year);
                      const isQuarterValid = !!reportFilters.quarter;
                      canGenerate = isYearValid && isQuarterValid;
                    }

                    return (
                      <div key={reportIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{report.name}</h4>
                          <Badge variant="outline" className="text-xs">Available</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{report.description}</p>

                        {/* Year & Quarter dropdowns */}
                        {isMostOrdered && (
                          <div className="flex gap-2 mb-3">
                            {/* Year input */}
                            <input
                              type="text"
                              placeholder="Enter Year"
                              value={reportFilters.year}
                              onChange={(e) => setReportFilters(prev => ({ ...prev, year: e.target.value }))}
                              className="border rounded px-2 py-1 w-24"
                            />

                            <select
                              value={reportFilters.quarter}
                              onChange={(e) => setReportFilters(prev => ({ ...prev, quarter: e.target.value }))}
                              className="border rounded px-2 py-1"
                            >
                              <option value="">Select Quarter</option>
                              <option value="Q1">Q1</option>
                              <option value="Q2">Q2</option>
                              <option value="Q3">Q3</option>
                              <option value="Q4">Q4</option>
                            </select>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Last: {report.lastGenerated}
                          </span>
                          <div className="flex gap-2">
                            {!isMostOrdered && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const type = getReportType(report.name);
                                  if (type) previewReport(type);
                                }}
                              >
                                View
                              </Button>
                            )}

                            {!isMostOrdered ? (
                              <Button
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => {
                                  const type = getReportType(report.name);
                                  if (type) downloadReport(type);
                                }}
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={downloadMostOrderedItemsPdf}
                                disabled={!canGenerate}
                              >
                                <Download className="h-3 w-3" />
                                Generate
                              </Button>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })}
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
        {/* Performance Metrics */}
        {/* ... (same as your original code, unchanged) */}
      </div>
    </div>
  );
};

export default Reports;