import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routeService } from "@/services/routeServise";

const ManageRoute = () => {
  const { id } = useParams();
  const [route, setRoute] = useState<any>(null);

  useEffect(() => {
    if (id) fetchRoute(id);
  }, [id]);

  const fetchRoute = async (routeId: string) => {
    const data = await routeService.getRouteById(routeId);
    setRoute(data);
  };

  if (!route) {
    return <p className="p-6">No route found with ID {id}</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Route - {route.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Route Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Area:</strong> {route.area}</p>
          <p><strong>Coverage:</strong> {route.coverage}</p>
          <p><strong>Status:</strong> {route.status}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Active Orders:</strong> {route.activeOrders}</p>
          <p><strong>Assigned Trucks:</strong> {route.trucks}</p>
          <p><strong>Assigned Drivers:</strong> {route.drivers}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageRoute;
