import { useParams } from "react-router-dom";

const routeLocations: Record<string, string> = {
  "R-01": "Colombo",
  "R-02": "Negombo",
  "R-03": "Galle",
  "R-04": "Kandy",
  "R-05": "Matara",
  "R-06": "Kurunegala",
  "R-07": "Jaffna",
  "R-08": "Trincomalee"
};

const RouteMap = () => {
  const { id } = useParams();
  const location = routeLocations[id || "R-01"] || "Sri Lanka";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Route Map - {id}</h1>
      <p className="text-muted-foreground">
        Showing map centered on <strong>{location}</strong>
      </p>
      <iframe
        title="route-map"
        src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
        width="100%"
        height="500"
        style={{ border: 0 }}
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default RouteMap;
