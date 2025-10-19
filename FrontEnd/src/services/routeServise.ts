// src/services/routeService.ts

export interface Route {
  id: string;
  name: string;
  area: string;
  coverage: string;
  max_delivery_time?: string;
  maxDeliveryTime?: string;
  activeOrders: number;
  trucks: number;
  drivers: number;
  assignedTrucks: number;
  assignedDrivers: number;
  status: string;
  lastDelivery?: string;
}

export interface CreateRouteDto {
  name: string;
  area: string;
  coverage: string;
  max_delivery_time?: string;
}

// LocalStorage key
const STORAGE_KEY = 'kandypack_routes';

// Initial mock data
const initialRoutes: Route[] = [
  {
    id: "R-01",
    name: "Colombo Central",
    area: "Colombo District",
    coverage: "Fort, Pettah, Kollupitiya, Bambalapitiya",
    activeOrders: 15,
    trucks: 3,
    drivers: 6,
    assignedTrucks: 3,
    assignedDrivers: 6,
    status: "Active",
    maxDeliveryTime: "4 hours",
    lastDelivery: "2024-08-07 14:30",
  },
  {
    id: "R-02",
    name: "Negombo Coast",
    area: "Gampaha District",
    coverage: "Negombo, Katunayake, Seeduwa, Ja-Ela",
    activeOrders: 8,
    trucks: 2,
    drivers: 4,
    assignedTrucks: 2,
    assignedDrivers: 4,
    status: "Active",
    maxDeliveryTime: "3 hours",
    lastDelivery: "2024-08-07 16:15",
  },
  {
    id: "R-03",
    name: "Galle Southern",
    area: "Southern Province",
    coverage: "Galle, Unawatuna, Hikkaduwa, Ambalangoda",
    activeOrders: 12,
    trucks: 2,
    drivers: 4,
    assignedTrucks: 2,
    assignedDrivers: 4,
    status: "Active",
    maxDeliveryTime: "5 hours",
    lastDelivery: "2024-08-07 11:45",
  },
];

// Helper functions for localStorage
const loadRoutes = (): Route[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading routes from localStorage:', error);
  }
  // Initialize with default data if nothing in storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRoutes));
  return initialRoutes;
};

const saveRoutes = (routes: Route[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  } catch (error) {
    console.error('Error saving routes to localStorage:', error);
  }
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const routeService = {
  getAllRoutes: async (): Promise<Route[]> => {
    await delay(200);
    return loadRoutes();
  },

  getRouteById: async (id: string): Promise<Route | undefined> => {
    await delay(200);
    const routes = loadRoutes();
    return routes.find((r) => r.id === id);
  },

  createRoute: async (data: CreateRouteDto): Promise<Route> => {
    await delay(300);
    const routes = loadRoutes();
    const newRoute: Route = {
      id: `R-${(routes.length + 1).toString().padStart(2, "0")}`,
      status: "Active",
      activeOrders: 0,
      trucks: 0,
      drivers: 0,
      assignedTrucks: 0,
      assignedDrivers: 0,
      name: data.name,
      area: data.area,
      coverage: data.coverage,
      max_delivery_time: data.max_delivery_time,
      maxDeliveryTime: data.max_delivery_time,
      lastDelivery: new Date().toISOString().split('T')[0] + " " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    const updatedRoutes = [...routes, newRoute];
    saveRoutes(updatedRoutes);
    return newRoute;
  },
  
  updateRoute: async (id: string, data: Partial<CreateRouteDto>): Promise<Route | undefined> => {
    await delay(300);
    const routes = loadRoutes();
    const index = routes.findIndex((r) => r.id === id);
    if (index !== -1) {
      routes[index] = { ...routes[index], ...data };
      saveRoutes(routes);
      return routes[index];
    }
    return undefined;
  },
  
  deleteRoute: async (id: string): Promise<boolean> => {
    await delay(300);
    const routes = loadRoutes();
    const index = routes.findIndex((r) => r.id === id);
    if (index !== -1) {
      routes.splice(index, 1);
      saveRoutes(routes);
      return true;
    }
    return false;
  },
};
