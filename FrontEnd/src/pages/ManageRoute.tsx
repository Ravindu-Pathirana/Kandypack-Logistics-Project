import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const routes = [
  { id: "R-01", name: "Colombo Central", area: "Colombo District", coverage: "Fort, Pettah, Kollupitiya, Bambalapitiya", activeOrders: 15, trucks: 3, drivers: 6, status: "Active" },
  { id: "R-02", name: "Negombo Coast", area: "Gampaha District", coverage: "Negombo, Katunayake, Seeduwa, Ja-Ela", activeOrders: 8, trucks: 2, drivers: 4, status: "Active" },
  { id: "R-03", name: "Galle Southern", area: "Southern Province", coverage: "Galle, Unawatuna, Hikkaduwa, Ambalangoda", activeOrders: 12, trucks: 2, drivers: 4, status: "Active" },
  { id: "R-04", name: "Kandy Hills", area: "Central Province", coverage: "Kandy City, Peradeniya, Gampola, Nawalapitiya", activeOrders: 6, trucks: 1, drivers: 2, status: "Active" },
  { id: "R-05", name: "Matara Deep South", area: "Southern Province", coverage: "Matara, Weligama, Mirissa, Tangalle", activeOrders: 9, trucks: 2, drivers: 4, status: "Active" },
  { id: "R-06", name: "Kurunegala Central", area: "North Western Province", coverage: "Kurunegala, Puttalam, Chilaw, Wariyapola", activeOrders: 4, trucks: 1, drivers: 2, status: "Maintenance" },
  { id: "R-07", name: "Jaffna Northern", area: "Northern Province", coverage: "Jaffna, Kilinochchi, Vavuniya, Mannar", activeOrders: 11, trucks: 2, drivers: 4, status: "Active" },
  { id: "R-08", name: "Trincomalee East", area: "Eastern Province", coverage: "Trincomalee, Batticaloa, Ampara, Kalmunai", activeOrders: 7, trucks: 2, drivers: 4, status: "Active" },
];

const ManageRoute = () => {
  const { id } = useParams();
  const route = routes.find((r) => r.id === id);

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
