// src/services/trainService.ts

// ⛔ No backend, no axios import

// A temporary mock "database" in memory
let mockTrains = [
  {
    train_id: "TR-001",
    route: "Kandy → Colombo",
    departure: "08:30",
    arrival: "11:00",
    capacity: 200,
  },
  {
    train_id: "TR-002",
    route: "Colombo → Galle",
    departure: "09:15",
    arrival: "12:00",
    capacity: 180,
  },
];

// This simulates network delay (optional)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const trainService = {
  // ✅ Simulate fetching train list
  getAllTrains: async () => {
    await delay(500); // simulate network delay
    return mockTrains;
  },

  // ✅ Simulate adding a train trip
  createTrainTrip: async (data: {
    train_id: string;
    route: string;
    departure: string;
    arrival: string;
    capacity: number;
  }) => {
    await delay(300);
    mockTrains = [...mockTrains, data];
    return data; // return added record
  },
};
