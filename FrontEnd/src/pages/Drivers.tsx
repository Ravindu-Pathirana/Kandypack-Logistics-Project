import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { driverService, type Driver, type CreateDriverDto } from '@/services/driverService';
import { useNavigate } from "react-router-dom";
import { 
    Users, 
    Clock, 
    Truck,
    Plus,
    Calendar,
  Phone,
  MapPin,
  AlertTriangle
} from "lucide-react";

// removed: top-level getHoursStatus (redefined below with UI-specific shape)

const Drivers = () => {
  const navigate = useNavigate();
  // state
  const [rawDrivers, setRawDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // fetch
  const fetchDrivers = async () => {
    try {
      const data = await driverService.getAllDrivers();
      setRawDrivers(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch drivers');
      toast({ title: 'Error', description: 'Failed to fetch drivers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  // Map backend Driver -> UI driver shape
  const mapApiDriver = (d: Driver) => ({
    id: d.employee_id ? String(d.employee_id) : undefined,
    name: d.employee_name || '',
    role: (d as any).role || 'Driver',
    phone: d.official_contact_number || '',
    experience: (d as any).experience || 'N/A',
    currentRoute: (d as any).current_route || '',
    currentLocation: (d as any).current_location || '',
    status: d.status || 'Off Duty',
    weeklyHours: (d.total_hours_week ?? (d as any).weekly_hours) || 0,
    maxWeeklyHours: ((d as any).max_weekly_hours) || 40,
    lastTrip: d.registrated_date ? String(d.registrated_date) : '',
    rating: (d as any).rating ?? 0,
    completedDeliveries: (d as any).completed_deliveries ?? 0
  });

  const drivers = rawDrivers.map(mapApiDriver);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Duty': return 'default';
      case 'Off Duty': return 'secondary';
      case 'On Leave': return 'destructive';
      case 'Break': return 'outline';
      default: return 'outline';
    }
  };

  const getHoursStatus = (hours: number, maxHours: number) => {
    const percentage = (maxHours === 0) ? 0 : (hours / maxHours) * 100;
    if (percentage >= 90) return { color: 'text-red-600', status: 'Critical' };
    if (percentage >= 70) return { color: 'text-orange-600', status: 'High' };
    return { color: 'text-green-600', status: 'Normal' };
  };

  const onDutyDrivers = drivers.filter((d: any) => d.status === 'On Duty' && d.role === 'Driver').length;
  const onDutyAssistants = drivers.filter((d: any) => d.status === 'On Duty' && d.role === 'Assistant').length;
  const totalDrivers = drivers.filter((d: any) => d.role === 'Driver').length;
  const totalAssistants = drivers.filter((d: any) => d.role === 'Assistant').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Drivers & Staff</h1>
          <p className="text-muted-foreground">Manage drivers, assistants, and workforce scheduling</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate("/drivers/add")}
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onDutyDrivers}</div>
            <p className="text-xs text-muted-foreground">out of {totalDrivers} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assistants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onDutyAssistants}</div>
            <p className="text-xs text-muted-foreground">out of {totalAssistants} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.length ? Math.round(drivers.reduce((sum: number, d: any) => sum + (d.weeklyHours || 0), 0) / drivers.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">hours per person</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-red-600">
              {drivers.filter((d: any) => (d.maxWeeklyHours || 0) > 0 && d.weeklyHours / d.maxWeeklyHours >= 0.9).length}
            </div>
            <p className="text-xs text-muted-foreground">Near limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {drivers.map((person) => {
          const hoursStatus = getHoursStatus(person.weeklyHours, person.maxWeeklyHours);
          
          return (
            <Card key={person.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/avatars/${person.id}.jpg`} />
                      <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{person.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        {person.role} • {person.id}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(person.status)}>
                    {person.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact & Experience */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{person.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{person.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{person.currentRoute} - {person.currentLocation}</span>
                  </div>
                </div>

                {/* Hours Tracking */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weekly Hours</span>
                    <span className={`font-medium ${hoursStatus.color}`}>
                      {person.weeklyHours}/{person.maxWeeklyHours}h
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        hoursStatus.status === 'Critical' ? 'bg-red-600' : 
                        hoursStatus.status === 'High' ? 'bg-orange-600' : 
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min((person.weeklyHours / person.maxWeeklyHours) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs ${hoursStatus.color}`}>
                    {hoursStatus.status} utilization
                  </p>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3 text-center pt-2 border-t">
                  <div>
                    <p className="text-lg font-bold text-primary">{person.rating}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{person.completedDeliveries}</p>
                    <p className="text-xs text-muted-foreground">Deliveries</p>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="text-xs text-muted-foreground">
                  Last trip: {person.lastTrip}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Schedule
                  </Button>
                  <Button size="sm" className="flex-1">
                    Assign Route
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Working Hours Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Working Hours Compliance</CardTitle>
          <CardDescription>Monitor weekly hour limits and overtime risks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drivers */}
              <div>
                <h4 className="font-medium mb-3">Drivers (40h limit)</h4>
                <div className="space-y-2">
                  {drivers.filter(d => d.role === 'Driver').map(driver => {
                    const percentage = (driver.weeklyHours / driver.maxWeeklyHours) * 100;
                    return (
                      <div key={driver.id} className="flex items-center justify-between text-sm">
                        <span>{driver.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                percentage >= 90 ? 'bg-red-600' : 
                                percentage >= 70 ? 'bg-orange-600' : 
                                'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs w-12 text-right">
                            {driver.weeklyHours}h
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assistants */}
              <div>
                <h4 className="font-medium mb-3">Assistants (60h limit)</h4>
                <div className="space-y-2">
                  {drivers.filter(d => d.role === 'Assistant').map(assistant => {
                    const percentage = (assistant.weeklyHours / assistant.maxWeeklyHours) * 100;
                    return (
                      <div key={assistant.id} className="flex items-center justify-between text-sm">
                        <span>{assistant.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                percentage >= 90 ? 'bg-red-600' : 
                                percentage >= 70 ? 'bg-orange-600' : 
                                'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs w-12 text-right">
                            {assistant.weeklyHours}h
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Drivers;