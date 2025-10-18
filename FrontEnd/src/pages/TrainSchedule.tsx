import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Train, 
  Clock, 
  MapPin, 
  Package,
  Plus,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const formSchema = z.object({
  train_name: z.string().min(1, { message: "Train name is required" }),
  start_station: z.string().min(1, { message: "Start station is required" }),
  destination_station: z.string().min(1, { message: "Destination station is required" }),
  departure_date_time: z.string().min(1, { message: "Departure time is required" }),
  arrival_date_time: z.string().min(1, { message: "Arrival time is required" }),
  capacity_space: z.number().positive({ message: "Capacity must be positive" }),
  status: z.enum(["On Time", "Delayed"], { message: "Status is required" }),
});

const TrainSchedule = () => {
  const [trainRoutes, setTrainRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      train_name: "",
      start_station: "Kandy",
      destination_station: "",
      departure_date_time: "",
      arrival_date_time: "",
      capacity_space: 0,
      status: "On Time",
    },
  });

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await fetch("http://localhost:8000/trains/");
        if (!response.ok) {
          throw new Error("Failed to fetch train schedules");
        }
        const data = await response.json();
        setTrainRoutes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Format datetime to ISO 8601 format without timezone
      const formattedValues = {
        ...values,
        departure_date_time: values.departure_date_time + ":00",
        arrival_date_time: values.arrival_date_time + ":00",
      };
      
      console.log("Sending data:", formattedValues);
      
      const response = await fetch("http://localhost:8000/trains/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        throw new Error(errorData.detail || "Failed to add train trip");
      }
      
      const data = await response.json();
      console.log("Success response:", data);
      toast.success("Train trip added successfully");
      setIsOpen(false);
      form.reset();
      
      // Refresh train list
      const updatedTrains = await fetch("http://localhost:8000/trains/").then(res => res.json());
      setTrainRoutes(updatedTrains);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to add train trip");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-muted-foreground">Loading train schedules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-destructive">Error: {error}</div>
      </div>
    );
  }

  if (trainRoutes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Train Schedule</h1>
            <p className="text-muted-foreground">Railway transport schedule and capacity management</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Train Trip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Train Trip</DialogTitle>
                <DialogDescription>Fill in the details to add a new train schedule.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="train_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Train Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Express1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="start_station"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Station</FormLabel>
                        <FormControl>
                          <Input placeholder="Kandy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination_station"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Station</FormLabel>
                        <FormControl>
                          <Input placeholder="Colombo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="departure_date_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departure Date/Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arrival_date_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival Date/Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity_space"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity Space</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="200" 
                            {...field} 
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="On Time">On Time</option>
                            <option value="Delayed">Delayed</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Save Train Trip</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No trains scheduled yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': 
      case 'on-time': 
        return 'default';
      case 'Delayed': 
      case 'delayed': 
        return 'destructive';
      case 'Scheduled': return 'secondary';
      case 'Cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On Time':
      case 'on-time':
        return <CheckCircle className="h-4 w-4" />;
      case 'Delayed':
      case 'delayed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Scheduled': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalCapacity = trainRoutes.reduce((sum, train) => sum + train.capacity, 0);
  const totalUtilized = trainRoutes.reduce((sum, train) => sum + train.utilized, 0);
  const overallUtilization = totalCapacity > 0 ? (totalUtilized / totalCapacity) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Train Schedule</h1>
          <p className="text-muted-foreground">Railway transport schedule and capacity management</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Train Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Train Trip</DialogTitle>
              <DialogDescription>Fill in the details to add a new train schedule.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="train_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Train Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Express1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_station"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Station</FormLabel>
                      <FormControl>
                        <Input placeholder="Kandy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destination_station"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Station</FormLabel>
                      <FormControl>
                        <Input placeholder="Colombo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departure_date_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Date/Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="arrival_date_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Date/Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity_space"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity Space</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="200" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="On Time">On Time</option>
                          <option value="Delayed">Delayed</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Train Trip</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trains</CardTitle>
            <Train className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainRoutes.length}</div>
            <p className="text-xs text-muted-foreground">Active routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Capacity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{totalUtilized}/{totalCapacity} units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Time</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainRoutes.filter(t => t.status === 'on-time' || t.status === 'On Time').length}</div>
            <p className="text-xs text-muted-foreground">Trains on schedule</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainRoutes.filter(t => t.status === 'delayed' || t.status === 'Delayed').length}</div>
            <p className="text-xs text-muted-foreground">Trains delayed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainRoutes.map((train) => {
          const utilizationPercentage = train.capacity > 0 ? (train.utilized / train.capacity) * 100 : 0;
          return (
            <Card key={train.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Train className="h-5 w-5" />
                    <CardTitle className="text-lg">{train.id}</CardTitle>
                  </div>
                  <Badge variant={getStatusColor(train.status)} className="flex items-center gap-1">
                    {getStatusIcon(train.status)}
                    {train.status}
                  </Badge>
                </div>
                <CardDescription>{train.route}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Departure</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {train.departure}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Arrival</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {train.arrival}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacity Utilization</span>
                    <span className="font-medium">
                      {train.utilized}/{train.capacity} units ({utilizationPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={utilizationPercentage} className="h-2" />
                  <div className={`text-xs ${
                    utilizationPercentage > 90 ? 'text-red-600' : 
                    utilizationPercentage > 70 ? 'text-orange-600' : 
                    'text-green-600'
                  }`}>
                    {utilizationPercentage > 90 ? 'Near capacity' : 
                     utilizationPercentage > 70 ? 'Good utilization' : 
                     'Available space'}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{train.orders} orders scheduled</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Next: {train.nextDeparture}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Manage Cargo
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule Overview</CardTitle>
          <CardDescription>Upcoming train departures for the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-xs text-center p-2 bg-muted rounded">
                    {Math.floor(Math.random() * 3) + 6} trips
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainSchedule;