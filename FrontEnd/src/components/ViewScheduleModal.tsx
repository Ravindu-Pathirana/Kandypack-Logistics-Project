import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Package, Truck } from "lucide-react";
import { driverService, type Driver } from "@/services/driverService";
import { useToast } from "@/components/ui/use-toast";

interface ScheduleEntry {
  id: string;
  date: string;
  time: string;
  route: string;
  status: "completed" | "in-progress" | "scheduled";
  deliveries: number;
  hours: number;
  location?: string;
}

interface ViewScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string;
  driverName: string;
}

export function ViewScheduleModal({
  open,
  onOpenChange,
  driverId,
  driverName,
}: ViewScheduleModalProps) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open && driverId) {
      loadSchedule();
    }
  }, [open, driverId]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const driverData = await driverService.getDriver(Number(driverId));
      setDriver(driverData);

      // Generate mock schedule based on driver data
      // In a real app, this would come from an API endpoint
      const mockSchedule: ScheduleEntry[] = [
        {
          id: "S001",
          date: "2024-08-07",
          time: "06:00 - 14:00",
          route: driverData.current_route || "R-01",
          status: "completed",
          deliveries: 12,
          hours: 8,
          location: driverData.current_location || "Colombo",
        },
        {
          id: "S002",
          date: "2024-08-06",
          time: "06:00 - 13:30",
          route: driverData.current_route || "R-01",
          status: "completed",
          deliveries: 10,
          hours: 7.5,
          location: driverData.current_location || "Colombo",
        },
        {
          id: "S003",
          date: "2024-08-05",
          time: "06:00 - 14:30",
          route: driverData.current_route || "R-01",
          status: "completed",
          deliveries: 15,
          hours: 8.5,
          location: driverData.current_location || "Colombo",
        },
        {
          id: "S004",
          date: "2024-08-08",
          time: "06:00 - 14:00",
          route: driverData.current_route || "R-01",
          status: "scheduled",
          deliveries: 14,
          hours: 8,
          location: driverData.current_location || "Colombo",
        },
        {
          id: "S005",
          date: "2024-08-09",
          time: "06:00 - 14:00",
          route: driverData.current_route || "R-01",
          status: "scheduled",
          deliveries: 13,
          hours: 8,
          location: driverData.current_location || "Colombo",
        },
      ];

      setSchedule(mockSchedule);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      case "scheduled":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "scheduled":
        return "Scheduled";
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Driver Schedule</DialogTitle>
          <DialogDescription>
            View {driverName}'s work schedule and history
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading schedule...
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Driver Stats Summary */}
            {driver && (
              <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{driver.weeklyHours || driver.total_hours_week || 0}</p>
                  <p className="text-xs text-muted-foreground">Hours This Week</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{driver.completed_deliveries || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Deliveries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{driver.rating || 0}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            )}

            {/* Schedule Timeline */}
            <div className="space-y-3">
              <h4 className="font-semibold">Schedule Timeline</h4>
              {schedule.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No schedule entries found
                </p>
              ) : (
                <div className="space-y-3">
                  {schedule.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{entry.date}</span>
                        </div>
                        <Badge variant={getStatusColor(entry.status)}>
                          {getStatusLabel(entry.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{entry.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Route {entry.route}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {entry.deliveries} deliveries
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{entry.location}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Working Hours</span>
                          <span className="font-medium">{entry.hours}h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Summary */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-semibold mb-3">Weekly Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Hours</p>
                  <p className="text-xl font-bold">
                    {schedule
                      .filter((s) => s.status === "completed")
                      .reduce((sum, s) => sum + s.hours, 0)}h
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed Trips</p>
                  <p className="text-xl font-bold">
                    {schedule.filter((s) => s.status === "completed").length}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Deliveries</p>
                  <p className="text-xl font-bold">
                    {schedule
                      .filter((s) => s.status === "completed")
                      .reduce((sum, s) => sum + s.deliveries, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Upcoming Trips</p>
                  <p className="text-xl font-bold">
                    {schedule.filter((s) => s.status === "scheduled").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
