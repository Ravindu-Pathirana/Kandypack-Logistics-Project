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
  Loader2,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const COLORS = ['#4CAF50', '#1976D2', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];

const InteractiveReports = () => {
  const [quickStats, setQuickStats] = useState([
    { label: "This Quarter Revenue", value: "Rs. 24.8M", change: "+12.5%", trend: "up" },
    { label: "Orders Delivered", value: "1,247", change: "+8.3%", trend: "up" },
    { label: "Average Delivery Time", value: "4.2 hrs", change: "-0.8 hrs", trend: "down" },
    { label: "Customer Satisfaction", value: "94.7%", change: "+2.1%", trend: "up" }
  ]);

  const [loading, setLoading] = useState({});
  const [downloading, setDownloading] = useState({});
  
  // Report data states
  const [quarterlySalesData, setQuarterlySalesData] = useState([]);
  const [mostOrderedData, setMostOrderedData] = useState([]);
  const [cityWiseData, setCityWiseData] = useState([]);
  const [routeWiseData, setRouteWiseData] = useState([]);
  const [driverHoursData, setDriverHoursData] = useState([]);
  const [truckUsageData, setTruckUsageData] = useState([]);

  // Filters
  const [mostOrderedFilters, setMostOrderedFilters] = useState({ year: "2025", quarter: "1" });
  const [cityWiseFilters, setCityWiseFilters] = useState({ year: "2025", quarter: "1" });
  const [routeWiseFilters, setRouteWiseFilters] = useState({ year: "2025", quarter: "1" });
  const [driverHoursFilters, setDriverHoursFilters] = useState({ year: "2025", quarter: "1" });
  const [truckUsageFilters, setTruckUsageFilters] = useState({ year: "2025", month: "1" });

  useEffect(() => {
    loadQuarterlySales();
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

  const loadQuarterlySales = async () => {
    setLoading(prev => ({ ...prev, quarterly: true }));
    try {
      const res = await fetch(`${API_BASE}/reports/quarterly-sales`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuarterlySalesData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load quarterly sales", err);
    } finally {
      setLoading(prev => ({ ...prev, quarterly: false }));
    }
  };

  const loadMostOrdered = async () => {
    setLoading(prev => ({ ...prev, mostOrdered: true }));
    try {
      const res = await fetch(
        `${API_BASE}/reports/most-ordered-items?year=${mostOrderedFilters.year}&quarter=${mostOrderedFilters.quarter}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMostOrderedData(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch (err) {
      console.error("Failed to load most ordered items", err);
    } finally {
      setLoading(prev => ({ ...prev, mostOrdered: false }));
    }
  };

  const loadCityWiseSales = async () => {
    setLoading(prev => ({ ...prev, cityWise: true }));
    try {
      const res = await fetch(
        `${API_BASE}/reports/city-wise-sales?year=${cityWiseFilters.year}&quarter=${cityWiseFilters.quarter}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCityWiseData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load city-wise sales", err);
    } finally {
      setLoading(prev => ({ ...prev, cityWise: false }));
    }
  };

  const loadRouteWise = async () => {
    setLoading(prev => ({ ...prev, routeWise: true }));
    try {
      const res = await fetch(
        `${API_BASE}/reports/route-wise-report?year=${routeWiseFilters.year}&quarter=${routeWiseFilters.quarter}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRouteWiseData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load route-wise report", err);
    } finally {
      setLoading(prev => ({ ...prev, routeWise: false }));
    }
  };

  const loadDriverHours = async () => {
    setLoading(prev => ({ ...prev, driverHours: true }));
    try {
      const res = await fetch(
        `${API_BASE}/reports/driver-hours?year=${driverHoursFilters.year}&quarter=${driverHoursFilters.quarter}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDriverHoursData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load driver hours", err);
    } finally {
      setLoading(prev => ({ ...prev, driverHours: false }));
    }
  };

  const loadTruckUsage = async () => {
    setLoading(prev => ({ ...prev, truckUsage: true }));
    try {
      const res = await fetch(
        `${API_BASE}/reports/truck-usage?year=${truckUsageFilters.year}&month=${truckUsageFilters.month}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTruckUsageData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load truck usage", err);
    } finally {
      setLoading(prev => ({ ...prev, truckUsage: false }));
    }
  };

  const downloadPDF = async (endpoint, filename, loadingKey) => {
    setDownloading(prev => ({ ...prev, [loadingKey]: true }));
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
      setDownloading(prev => ({ ...prev, [loadingKey]: false }));
    }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl font-bold">{stat.value}</CardTitle>
              <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quarterly Sales */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-start pb-3">
          <div>
            <CardTitle className="text-lg">Quarterly Sales Report</CardTitle>
            <CardDescription className="text-xs">Monthly breakdown of sales and order volume</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadQuarterlySales}
              disabled={loading.quarterly}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${loading.quarterly ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              onClick={() => downloadPDF("/reports/quarterly-sales/pdf", "Quarterly_Sales_Report.pdf", "quarterly-sales-pdf")}
              disabled={downloading["quarterly-sales-pdf"]}
              className="h-8 px-2 text-xs flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quarterlySalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={quarterlySalesData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={40} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={40} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="total_sales" fill="#4CAF50" name="Sales" />
                <Bar yAxisId="right" dataKey="order_count" fill="#1976D2" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-muted-foreground text-sm">
              {loading.quarterly ? "Loading..." : "No data available"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Most Ordered Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-lg">Most Ordered Items</CardTitle>
              <CardDescription className="text-xs">Top selling products by quarter</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => downloadPDF(`/reports/most-ordered-items?year=${mostOrderedFilters.year}&quarter=${mostOrderedFilters.quarter}`, `Most_Ordered_Items_Q${mostOrderedFilters.quarter}_${mostOrderedFilters.year}.pdf`, "mostordered-pdf")}
              disabled={downloading["mostordered-pdf"]}
              className="h-8 px-2 text-xs flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input
              type="text"
              placeholder="Year"
              value={mostOrderedFilters.year}
              onChange={(e) => setMostOrderedFilters({ ...mostOrderedFilters, year: e.target.value })}
              className="w-20 h-8 text-xs"
            />
            <select
              value={mostOrderedFilters.quarter}
              onChange={(e) => setMostOrderedFilters({ ...mostOrderedFilters, quarter: e.target.value })}
              className="border rounded px-2 py-1 text-xs h-8"
            >
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
            <Button onClick={loadMostOrdered} disabled={loading.mostOrdered} size="sm" className="h-8 text-xs px-2">
              {loading.mostOrdered ? "Loading..." : "Load"}
            </Button>
          </div>

          {mostOrderedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mostOrderedData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="product_name" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} width={35} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="order_count" fill="#4CAF50" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-muted-foreground text-sm">
              {loading.mostOrdered ? "Loading..." : "Select filters and click Load"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* City-wise Sales */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-lg">City-wise Sales</CardTitle>
              <CardDescription className="text-xs">Sales breakdown by destination city</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => downloadPDF(`/reports/city-wise-sales/pdf?year=${cityWiseFilters.year}&quarter=${cityWiseFilters.quarter}`, `City_Wise_Sales_Q${cityWiseFilters.quarter}_${cityWiseFilters.year}.pdf`, "citywise-pdf")}
              disabled={downloading["citywise-pdf"]}
              className="h-8 px-2 text-xs flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input
              type="text"
              placeholder="Year"
              value={cityWiseFilters.year}
              onChange={(e) => setCityWiseFilters({ ...cityWiseFilters, year: e.target.value })}
              className="w-20 h-8 text-xs"
            />
            <select
              value={cityWiseFilters.quarter}
              onChange={(e) => setCityWiseFilters({ ...cityWiseFilters, quarter: e.target.value })}
              className="border rounded px-2 py-1 text-xs h-8"
            >
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
            <Button onClick={loadCityWiseSales} disabled={loading.cityWise} size="sm" className="h-8 text-xs px-2">
              {loading.cityWise ? "Loading..." : "Load"}
            </Button>
          </div>

          {cityWiseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cityWiseData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="city" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={40} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={40} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="total_sales" fill="#4CAF50" name="Sales" />
                <Bar yAxisId="right" dataKey="order_count" fill="#1976D2" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-muted-foreground text-sm">
              {loading.cityWise ? "Loading..." : "Select filters and click Load"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route-wise Report */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-lg">Route-wise Delivery Performance</CardTitle>
              <CardDescription className="text-xs">On-time delivery rates by route</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => downloadPDF(`/reports/route-wise-report/pdf?year=${routeWiseFilters.year}&quarter=${routeWiseFilters.quarter}`, `Route_Wise_Report_Q${routeWiseFilters.quarter}_${routeWiseFilters.year}.pdf`, "routewise-pdf")}
              disabled={downloading["routewise-pdf"]}
              className="h-8 px-2 text-xs flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input
              type="text"
              placeholder="Year"
              value={routeWiseFilters.year}
              onChange={(e) => setRouteWiseFilters({ ...routeWiseFilters, year: e.target.value })}
              className="w-20 h-8 text-xs"
            />
            <select
              value={routeWiseFilters.quarter}
              onChange={(e) => setRouteWiseFilters({ ...routeWiseFilters, quarter: e.target.value })}
              className="border rounded px-2 py-1 text-xs h-8"
            >
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
            <Button onClick={loadRouteWise} disabled={loading.routeWise} size="sm" className="h-8 text-xs px-2">
              {loading.routeWise ? "Loading..." : "Load"}
            </Button>
          </div>

          {routeWiseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={routeWiseData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="route_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={35} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="on_time_percentage" fill="#4CAF50" name="On-time %" />
                <Bar dataKey="delayed_count" fill="#F44336" name="Delayed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-muted-foreground text-sm">
              {loading.routeWise ? "Loading..." : "Select filters and click Load"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver Hours */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-lg">Driver & Assistant Hours</CardTitle>
              <CardDescription className="text-xs">Working hours and deliveries per person</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => downloadPDF(`/reports/driver-hours/pdf?year=${driverHoursFilters.year}&quarter=${driverHoursFilters.quarter}`, `Driver_Hours_Q${driverHoursFilters.quarter}_${driverHoursFilters.year}.pdf`, "driverhours-pdf")}
              disabled={downloading["driverhours-pdf"]}
              className="h-8 px-2 text-xs flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input
              type="text"
              placeholder="Year"
              value={driverHoursFilters.year}
              onChange={(e) => setDriverHoursFilters({ ...driverHoursFilters, year: e.target.value })}
              className="w-20 h-8 text-xs"
            />
            <select
              value={driverHoursFilters.quarter}
              onChange={(e) => setDriverHoursFilters({ ...driverHoursFilters, quarter: e.target.value })}
              className="border rounded px-2 py-1 text-xs h-8"
            >
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
            <Button onClick={loadDriverHours} disabled={loading.driverHours} size="sm" className="h-8 text-xs px-2">
              {loading.driverHours ? "Loading..." : "Load"}
            </Button>
          </div>

          {driverHoursData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-2 py-2 text-left font-medium">Driver</th>
                    <th className="px-2 py-2 text-left font-medium">Assistant</th>
                    <th className="px-2 py-2 text-left font-medium">Deliveries</th>
                    <th className="px-2 py-2 text-left font-medium">Hours</th>
                    <th className="px-2 py-2 text-left font-medium">Avg/Del</th>
                  </tr>
                </thead>
                <tbody>
                  {driverHoursData.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="px-2 py-2">{item.driver_name}</td>
                      <td className="px-2 py-2">{item.assistant_name}</td>
                      <td className="px-2 py-2">{item.total_deliveries}</td>
                      <td className="px-2 py-2">{item.total_hours}</td>
                      <td className="px-2 py-2">{item.avg_hours_per_delivery?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              {loading.driverHours ? "Loading..." : "Select filters and click Load"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Truck Usage */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-lg">Truck Usage Analysis</CardTitle>
              <CardDescription className="text-xs">Monthly vehicle utilization metrics</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => downloadPDF(`/reports/truck-usage/pdf?year=${truckUsageFilters.year}&month=${truckUsageFilters.month}`, `Truck_Usage_${truckUsageFilters.year}_${truckUsageFilters.month}.pdf`, "truckusage-pdf")}
              disabled={downloading["truckusage-pdf"]}
              className="h-8 px-2 text-xs flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input
              type="text"
              placeholder="Year"
              value={truckUsageFilters.year}
              onChange={(e) => setTruckUsageFilters({ ...truckUsageFilters, year: e.target.value })}
              className="w-20 h-8 text-xs"
            />
            <select
              value={truckUsageFilters.month}
              onChange={(e) => setTruckUsageFilters({ ...truckUsageFilters, month: e.target.value })}
              className="border rounded px-2 py-1 text-xs h-8"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <Button onClick={loadTruckUsage} disabled={loading.truckUsage} size="sm" className="h-8 text-xs px-2">
              {loading.truckUsage ? "Loading..." : "Load"}
            </Button>
          </div>

          {truckUsageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={truckUsageData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="truck_id" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={35} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={35} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="total_hours" fill="#1976D2" name="Hours" />
                <Bar yAxisId="right" dataKey="total_deliveries" fill="#4CAF50" name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-muted-foreground text-sm">
              {loading.truckUsage ? "Loading..." : "Select filters and click Load"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveReports;