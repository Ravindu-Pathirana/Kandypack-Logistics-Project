import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { routeService, type Route } from "@/services/routeServise";
import { driverService } from "@/services/driverService";
import { MapPin, Truck, Clock } from "lucide-react";

interface AssignRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string;
  driverName: string;
  currentRoute?: string;
  onAssigned?: () => void;
}

export function AssignRouteModal({
  open,
  onOpenChange,
  driverId,
  driverName,
  currentRoute,
  onAssigned,
}: AssignRouteModalProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>(currentRoute || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadRoutes();
    }
  }, [open]);

  const loadRoutes = async () => {
    try {
      const data = await routeService.getAllRoutes();
      setRoutes(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load routes",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async () => {
    if (!selectedRoute) {
      toast({
        title: "Validation Error",
        description: "Please select a route",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update driver's current route
      await driverService.updateDriver(Number(driverId), {
        current_route: selectedRoute,
        status: "On Duty"
      });

      toast({
        title: "Success",
        description: `${driverName} assigned to route ${selectedRoute}`,
      });

      onOpenChange(false);
      if (onAssigned) {
        onAssigned();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign route",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Route</DialogTitle>
          <DialogDescription>
            Assign {driverName} to a delivery route
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Assignment */}
          {currentRoute && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-1">Current Assignment</p>
              <p className="text-lg font-semibold text-primary">{currentRoute}</p>
            </div>
          )}

          {/* Route Selection */}
          <div className="space-y-2">
            <Label htmlFor="route">Select Route</Label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger id="route">
                <SelectValue placeholder="Choose a route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{route.id}</span>
                      <span className="text-muted-foreground">- {route.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Route Details */}
          {selectedRoute && routes.find(r => r.id === selectedRoute) && (
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-semibold">Route Details</h4>
              {(() => {
                const route = routes.find(r => r.id === selectedRoute)!;
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-muted-foreground">{route.area}</p>
                        <p className="text-muted-foreground text-xs mt-1">{route.coverage}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Max delivery time: {route.maxDeliveryTime || route.max_delivery_time || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {route.activeOrders} active orders • {route.assignedTrucks} trucks
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedRoute}>
            {loading ? "Assigning..." : "Assign Route"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
