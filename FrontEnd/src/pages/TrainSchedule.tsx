import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Train, Clock, MapPin, Package, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Local simple MultiSelect fallback
type Option = { value: string; label: string };
interface MultiSelectProps {
  options: Option[];
  value?: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
}
const MultiSelect = ({ options, value = [], onChange }: MultiSelectProps) => {
  const handleChange = (e: any) => {
    const selected = Array.from(e.target.selectedOptions).map((opt: any) => {
      const found = options.find(o => o.value === opt.value);
      return found || { value: opt.value, label: opt.label };
    });
    onChange(selected);
  };

  return (
    <select
      multiple
      value={value.map(v => v.value)}
      onChange={handleChange}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

const trainSchema = z.object({
  train_name: z.string().min(1, { message: "Train name is required" }),
  start_station: z.string().min(1, { message: "Start station is required" }),
  destination_station: z.string().min(1, { message: "Destination station is required" }),
  departure_date_time: z.string().optional(),
  departure_time: z.string().optional(),
  arrival_date_time: z.string().optional(),
  arrival_time: z.string().optional(),
  capacity_space: z.number().positive({ message: "Capacity must be positive" }),
  status: z.enum(["On Time", "Delayed"], { message: "Status is required" }),
  schedule_type: z.enum(["Occasional Trip", "Recurring Daily Train", "Recurring Weekly", "Recurring Multi-Day"], { message: "Schedule type is required" }),
  frequency_days: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.schedule_type === "Recurring Weekly" && (!data.frequency_days || data.frequency_days.length !== 1)) {
    return false;
  }
  return true;
}, {
  message: "Recurring Weekly requires exactly one day",
  path: ["frequency_days"],
});

const TrainSchedule = () => {
  const [trainRoutes, setTrainRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const trainForm = useForm<z.infer<typeof trainSchema>>({
    resolver: zodResolver(trainSchema),
    defaultValues: {
      train_name: "",
      start_station: "Kandy",
      destination_station: "",
      departure_date_time: "",
      departure_time: "",
      arrival_date_time: "",
      arrival_time: "",
      capacity_space: 0,
      status: "On Time",
      schedule_type: "Occasional Trip",
      frequency_days: [],
    },
  });

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await fetch("http://localhost:8000/trains/");
        if (!response.ok) throw new Error("Failed to fetch train schedules");
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

  const onSubmit = async (values: z.infer<typeof trainSchema>) => {
    try {
      const payload: Record<string, any> = {
        train_name: values.train_name,
        start_station: values.start_station,
        destination_station: values.destination_station,
        capacity_space: values.capacity_space,
        status: values.status,
        frequency_days: values.frequency_days,
      };

      if (values.schedule_type === "Occasional Trip") {
        if (!values.departure_date_time || !values.arrival_date_time) {
          throw new Error("Departure and arrival datetime required for occasional trips");
        }
        payload.departure_date_time = values.departure_date_time + ":00";
        payload.arrival_date_time = values.arrival_date_time + ":00";
        const response = await fetch("http://localhost:8000/trains/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to add train trip");
      } else {
        if (!values.departure_time || !values.arrival_time) {
          throw new Error("Departure and arrival time required for recurring schedules");
        }
        payload.departure_time = values.departure_time + ":00";
        payload.arrival_time = values.arrival_time + ":00";
        const response = await fetch("http://localhost:8000/trains/templates/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to add train template");
      }

      toast.success(`${values.schedule_type} added successfully`);
      setIsFormOpen(false);
      trainForm.reset();
      const updatedTrains = await fetch("http://localhost:8000/trains/").then(res => res.json());
      setTrainRoutes(updatedTrains);
    } catch (err) {
      toast.error(err.message || "Failed to add schedule");
    }
  };

  const getStatusColor = (status: string): "destructive" | "default" | "outline" | "secondary" =>
    (status.toLowerCase() === "on-time" || status === "On Time") ? "default" : "destructive";
  const getStatusIcon = (status: string) => (status.toLowerCase() === "on-time" || status === "On Time" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />);

  const totalCapacity = trainRoutes.reduce((sum, train) => sum + train.capacity, 0);
  const totalUtilized = trainRoutes.reduce((sum, train) => sum + train.utilized, 0);
  const overallUtilization = totalCapacity > 0 ? (totalUtilized / totalCapacity) * 100 : 0;

  if (loading) return <div className="flex justify-center items-center h-64">Loading train schedules...</div>;
  if (error) return <div className="flex justify-center items-center h-64">Error: {error}</div>;

  const trainsByDay = trainRoutes.reduce((acc, train) => {
  const d = new Date(train.nextDeparture);
  const key = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  acc[key] = acc[key] || [];
  acc[key].push(train);
  return acc;
}, {} as { [key: string]: typeof trainRoutes });


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Train Schedule</h1>
          <p className="text-muted-foreground">Railway transport schedule and capacity management</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Train Schedule
            </Button>
          </DialogTrigger>
          <Button
            variant="outline"
            onClick={async () => {
              await fetch("http://localhost:8000/trains/generate", { method: "POST" });
              const updated = await fetch("http://localhost:8000/trains/").then(r => r.json());
              setTrainRoutes(updated);
            }}
          >
            Sync Next 14 Days
          </Button>

          <DialogContent className="max-w-2xl w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Add New Train Schedule</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">Fill in the details for a new train schedule.</DialogDescription>
            </DialogHeader>
            <Form {...trainForm}>
              <form onSubmit={trainForm.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={trainForm.control}
                    name="train_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Train Name</FormLabel>
                        <FormControl><Input placeholder="Express1" {...field} className="w-full" /></FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={trainForm.control}
                    name="start_station"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Station</FormLabel>
                        <FormControl><Input placeholder="Kandy" {...field} className="w-full" /></FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={trainForm.control}
                    name="destination_station"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Destination Station</FormLabel>
                        <FormControl><Input placeholder="Colombo" {...field} className="w-full" /></FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={trainForm.control}
                    name="schedule_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select schedule type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Occasional Trip">Occasional Trip</SelectItem>
                              <SelectItem value="Recurring Daily Train">Recurring Daily Train</SelectItem>
                              <SelectItem value="Recurring Weekly">Recurring Weekly</SelectItem>
                              <SelectItem value="Recurring Multi-Day">Recurring Multi-Day</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                {trainForm.watch("schedule_type") === "Occasional Trip" ? (
                  <>
                    <FormField
                      control={trainForm.control}
                      name="departure_date_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Departure Date/Time</FormLabel>
                          <FormControl><Input type="datetime-local" {...field} className="w-full" /></FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={trainForm.control}
                      name="arrival_date_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Arrival Date/Time</FormLabel>
                          <FormControl><Input type="datetime-local" {...field} className="w-full" /></FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <FormField
                      control={trainForm.control}
                      name="departure_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Departure Time</FormLabel>
                          <FormControl><Input type="time" {...field} className="w-full" /></FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={trainForm.control}
                      name="arrival_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Arrival Time</FormLabel>
                          <FormControl><Input type="time" {...field} className="w-full" /></FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    {trainForm.watch("schedule_type") === "Recurring Weekly" && (
                      <FormField
                        control={trainForm.control}
                        name="frequency_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency Day</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(value) => field.onChange([value])}
                                value={field.value?.[0] || ""}
                              >
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select a day" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Monday">Monday</SelectItem>
                                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                                  <SelectItem value="Thursday">Thursday</SelectItem>
                                  <SelectItem value="Friday">Friday</SelectItem>
                                  <SelectItem value="Saturday">Saturday</SelectItem>
                                  <SelectItem value="Sunday">Sunday</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    )}
                    {trainForm.watch("schedule_type") === "Recurring Multi-Day" && (
                      <FormField
                        control={trainForm.control}
                        name="frequency_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency Days</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => (
                                <label key={day} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    value={day}
                                    checked={field.value?.includes(day) || false}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        field.onChange([...(field.value || []), day]);
                                      } else {
                                        field.onChange((field.value || []).filter((d) => d !== day));
                                      }
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <span>{day}</span>
                                </label>
                              ))}
                            </div>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={trainForm.control}
                    name="capacity_space"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Capacity Space</FormLabel>
                        <FormControl><Input type="number" placeholder="200" {...field} value={field.value || ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} className="w-full" /></FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={trainForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</FormLabel>
                        <FormControl>
                          <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="On Time">On Time</option>
                            <option value="Delayed">Delayed</option>
                          </select>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors">
                  Save Schedule
                </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule Overview</CardTitle>
          <CardDescription>Expand days to view train details</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {Object.keys(trainsByDay).map((day) => (
              <AccordionItem key={day} value={day}>
                <AccordionTrigger>{day} ({trainsByDay[day].length} trips)</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trainsByDay[day].map((train) => {
                      const utilizationPercentage = train.capacity > 0 ? (train.utilized / train.capacity) * 100 : 0;
                      return (
                        <Card key={train.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Train className="h-5 w-5" />
                                <CardTitle className="text-lg">{train.id}</CardTitle>
                              </div>
                              <Badge
                                variant={(train.is_cancelled || train.status === 'cancelled') ? "destructive" : getStatusColor(train.status)}
                                className={`flex items-center gap-1 ${train.is_cancelled ? "line-through" : ""}`}
                              >
                                {train.is_cancelled ? <AlertTriangle className="h-4 w-4 text-red-600" /> : getStatusIcon(train.status)}
                                {train.is_cancelled ? "Cancelled" : train.status}
                              </Badge>

                            </div>
                            <CardDescription>{train.route}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Departure</span><span>{train.departure}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Arrival</span><span>{train.arrival}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Capacity Utilization</span><span>{utilizationPercentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={utilizationPercentage} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainSchedule;



