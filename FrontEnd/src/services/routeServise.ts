// src/services/routeService.ts

// In-memory “DB”
let mockRoutes = [
  {
    id: "R-01",
    name: "Colombo Central",
    area: "Colombo District",
    coverage: "Fort, Pettah, Kollupitiya, Bambalapitiya",
    activeOrders: 15,
    trucks: 3,
    drivers: 6,
    status: "Active",
  },
  {
    id: "R-02",
    name: "Negombo Coast",
    area: "Gampaha District",
    coverage: "Negombo, Katunayake, Seeduwa, Ja-Ela",
    activeOrders: 8,
    trucks: 2,
    drivers: 4,
    status: "Active",
  },
  {
    id: "R-03",
    name: "Galle Southern",
    area: "Southern Province",
    coverage: "Galle, Unawatuna, Hikkaduwa, Ambalangoda",
    activeOrders: 12,
    trucks: 2,
    drivers: 4,
    status: "Active",
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const routeService = {
  getAllRoutes: async () => {
    await delay(200);
    return mockRoutes;
  },

  getRouteById: async (id: string) => {
    await delay(200);
    return mockRoutes.find((r) => r.id === id);
  },

  createRoute: async (data: {
    name: string;
    area: string;
    coverage: string;
    max_delivery_time?: string;
  }) => {
    await delay(300);
    const newRoute = {
      id: `R-${(mockRoutes.length + 1).toString().padStart(2, "0")}`,
      status: "Active",
      activeOrders: 0,
      trucks: 0,
      drivers: 0,
      ...data,
    };
    mockRoutes = [...mockRoutes, newRoute];
    return newRoute;
  },
};
