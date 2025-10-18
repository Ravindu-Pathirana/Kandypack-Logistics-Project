// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  Users,
  FileText,
  Loader2
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const Reports = () => {
  const [quickStats, setQuickStats] = useState([
    { label: "This Quarter Revenue", value: "Rs. 24.8M", change: "+12.5%", trend: "up" },
    { label: "Orders Delivered", value: "1,247", change: "+8.3%", trend: "up" },
    { label: "Average Delivery Time", value: "4.2 hrs", change: "-0.8 hrs", trend: "down" },
    { label: "Customer Satisfaction", value: "94.7%", change: "+2.1%", trend: "up" }
  ]);

  const [loading, setLoading] = useState({});
  
  // Filters for different reports
  const [mostOrderedFilters, setMostOrderedFilters] = useState({ year: "", quarter: "" });
  const [cityWiseFilters, setCityWiseFilters] = useState({ year: "", quarter: "" });
  const [routeWiseFilters, setRouteWiseFilters] = useState({ year: "", quarter: "" });
  const [driverHoursFilters, setDriverHoursFilters] = useState({ year: "", quarter: "" });
  const [truckUsageFilters, setTruckUsageFilters] = useState({ year: "", month: "" });
  const [customerOrderFilters, setCustomerOrderFilters] = useState({ customerId: "" });

  useEffect(() => {
    loadKpis();
  }, []);

  const loadKpis = async () => {
    try {
      const res = await fetch(`${API_BASE}/dasshboard/kpi`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const mapped = data.map((item) => ({
        label: item.name ?? item.label ?? "",
        value: Array.isArray(item.value) ? String(item.value[0]) : String(item.value ?? "0"),
        change: item.change,
        trend: item.trend
      }));

      if (mapped.length) setQuickStats(mapped);
    } catch (err) {
      console.error("Failed to load KPIs", err);
    }
  };

  const downloadPDF = async (endpoint, filename, loadingKey) => {
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to download ${filename}`, err);
      alert(`Failed to download report: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const previewPDF = (endpoint) => {
    window.open(`${API_BASE}${endpoint}`, "_blank");
  };

  const handleQuarterlySales = () => {
    downloadPDF("/reports/quarterly-sales/pdf", "Quarterly_Sales_Report.pdf", "quarterly-sales");
  };

  const handleMostOrderedItems = () => {
    const { year, quarter } = mostOrderedFilters;
    if (!year || !quarter) {
      alert("Please select both year and quarter");
      return;
    }
    const quarterNum = quarter.replace('Q', '');
    downloadPDF(
      `/reports/most-ordered-items?year=${year}&quarter=${quarterNum}`,
      `Most_Ordered_Items_Q${quarterNum}_${year}.pdf`,
      "most-ordered"
    );
  };

  const handleCityWiseSales = () => {
    const { year, quarter } = cityWiseFilters;
    if (!year || !quarter) {
      alert("Please select both year and quarter");
      return;
    }
    const quarterNum = quarter.replace('Q', '');
    downloadPDF(
      `/reports/city-wise-sales/pdf?year=${year}&quarter=${quarterNum}`,
      `City_Wise_Sales_Q${quarterNum}_${year}.pdf`,
      "city-wise"
    );
  };

  const handleRouteWise = () => {
    const { year, quarter } = routeWiseFilters;
    if (!year || !quarter) {
      alert("Please select both year and quarter");
      return;
    }
    const quarterNum = quarter.replace('Q', '');
    downloadPDF(
      `/reports/route-wise-report/pdf?year=${year}&quarter=${quarterNum}`,
      `Route_Wise_Report_Q${quarterNum}_${year}.pdf`,
      "route-wise"
    );
  };

  const handleDriverHours = () => {
    const { year, quarter } = driverHoursFilters;
    if (!year || !quarter) {
      alert("Please select both year and quarter");
      return;
    }
    const quarterNum = quarter.replace('Q', '');
    downloadPDF(
      `/reports/driver-hours/pdf?year=${year}&quarter=${quarterNum}`,
      `Driver_Hours_Q${quarterNum}_${year}.pdf`,
      "driver-hours"
    );
  };

  const handleTruckUsage = () => {
    const { year, month } = truckUsageFilters;
    if (!year || !month) {
      alert("Please select both year and month");
      return;
    }
    downloadPDF(
      `/reports/truck-usage/pdf?year=${year}&month=${month}`,
      `Truck_Usage_${year}_${month}.pdf`,
      "truck-usage"
    );
  };

  const handleCustomerOrderHistory = () => {
    const { customerId } = customerOrderFilters;
    if (!customerId) {
      alert("Please enter customer ID");
      return;
    }
    downloadPDF(
      `/reports/customer-order-history/pdf?customer_id=${customerId}`,
      `Customer_${customerId}_Order_History.pdf`,
      "customer-order"
    );
  };

  const reportCategories = [
    {
      title: "Sales Reports",
      description: "Revenue and sales volume analysis",
      icon: TrendingUp,
      reports: [
        { 
          id: "quarterly-sales",
          name: "Quarterly Sales Report", 
          description: "Value and volume breakdown by quarter", 
          lastGenerated: "2024-08-01",
          hasFilters: false,
          onDownload: handleQuarterlySales,
          onPreview: () => previewPDF("/reports/quarterly-sales/pdf")
        },
        { 
          id: "most-ordered",
          name: "Most Ordered Items", 
          description: "Top selling products in given quarter", 
          lastGenerated: "2024-08-01",
          hasFilters: true,
          filters: mostOrderedFilters,
          setFilters: setMostOrderedFilters,
          filterType: "year-quarter",
          onDownload: handleMostOrderedItems
        },
        { 
          id: "city-wise",
          name: "City-wise Sales", 
          description: "Sales breakdown by destination city", 
          lastGenerated: "2024-08-05",
          hasFilters: true,
          filters: cityWiseFilters,
          setFilters: setCityWiseFilters,
          filterType: "year-quarter",
          onDownload: handleCityWiseSales
        },
        { 
          id: "route-wise",
          name: "Route-wise Report", 
          description: "Performance analysis by delivery route", 
          lastGenerated: "2024-08-03",
          hasFilters: true,
          filters: routeWiseFilters,
          setFilters: setRouteWiseFilters,
          filterType: "year-quarter",
          onDownload: handleRouteWise
        }
      ]
    },
    {
      title: "Operations Reports",
      description: "Logistics and operational metrics",
      icon: Package,
      reports: [
        { 
          id: "customer-order",
          name: "Customer Order History", 
          description: "Complete delivery history per customer", 
          lastGenerated: "2024-08-06",
          hasFilters: true,
          filters: customerOrderFilters,
          setFilters: setCustomerOrderFilters,
          filterType: "customer-id",
          onDownload: handleCustomerOrderHistory
        },
        { 
          id: "truck-usage",
          name: "Truck Usage Analysis", 
          description: "Monthly vehicle utilization report", 
          lastGenerated: "2024-08-01",
          hasFilters: true,
          filters: truckUsageFilters,
          setFilters: setTruckUsageFilters,
          filterType: "year-month",
          onDownload: handleTruckUsage
        }
      ]
    },
    {
      title: "HR Reports",
      description: "Workforce and staffing analytics",
      icon: Users,
      reports: [
        { 
          id: "driver-hours",
          name: "Driver Working Hours", 
          description: "Weekly and monthly hour tracking", 
          lastGenerated: "2024-08-07",
          hasFilters: true,
          filters: driverHoursFilters,
          setFilters: setDriverHoursFilters,
          filterType: "year-quarter",
          onDownload: handleDriverHours
        }
      ]
    }
  ];

  const renderFilters = (report) => {
    if (!report.hasFilters) return null;

    const { filters, setFilters, filterType } = report;
    const canGenerate = filterType === "customer-id" 
      ? filters.customerId 
      : filterType === "year-month"
      ? filters.year && filters.month
      : filters.year && filters.quarter;

    return (
      <div className="mb-3">
        {filterType === "year-quarter" && (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Year (e.g., 2025)"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-32"
            />
            <select
              value={filters.quarter}
              onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">Select Quarter</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>
        )}
        {filterType === "year-month" && (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Year (e.g., 2025)"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-32"
            />
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">Select Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        )}
        {filterType === "customer-id" && (
          <Input
            type="text"
            placeholder="Customer ID"
            value={filters.customerId}
            onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
            className="w-40"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business intelligence and operational insights</p>
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
                  {category.reports.map((report) => {
                    const isLoading = loading[report.id];
                    
                    return (
                      <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{report.name}</h4>
                          <Badge variant="outline" className="text-xs">Available</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{report.description}</p>

                        {renderFilters(report)}

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Last: {report.lastGenerated}
                          </span>
                          <div className="flex gap-2">
                            {report.onPreview && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={report.onPreview}
                              >
                                View
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={report.onDownload}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                              {isLoading ? "Generating..." : "Download"}
                            </Button>
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
    </div>
  );
};

export default Reports;