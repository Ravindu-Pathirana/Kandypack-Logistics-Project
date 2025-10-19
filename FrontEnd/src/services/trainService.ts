// src/services/trainService.ts

export interface Train {
  train_id: string;
  route: string;
  departure: string;
  arrival: string;
  capacity: number;
}

export interface CreateTrainTripDto {
  train_id: string;
  route: string;
  departure: string;
  arrival: string;
  capacity: number;
}

// LocalStorage key
const STORAGE_KEY = 'kandypack_trains';

// ⛔ No backend, no axios import

// Initial mock "database"
const initialTrains: Train[] = [
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

// Helper functions for localStorage
const loadTrains = (): Train[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading trains from localStorage:', error);
  }
  // Initialize with default data if nothing in storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTrains));
  return initialTrains;
};

const saveTrains = (trains: Train[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trains));
  } catch (error) {
    console.error('Error saving trains to localStorage:', error);
  }
};

// This simulates network delay (optional)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const trainService = {
  // ✅ Simulate fetching train list
  getAllTrains: async (): Promise<Train[]> => {
    await delay(500); // simulate network delay
    return loadTrains();
  },

  // ✅ Simulate adding a train trip
  createTrainTrip: async (data: CreateTrainTripDto): Promise<Train> => {
    await delay(300);
    const trains = loadTrains();
    const newTrain: Train = { ...data };
    const updatedTrains = [...trains, newTrain];
    saveTrains(updatedTrains);
    return newTrain; // return added record
  },
  
  // ✅ Get train by ID
  getTrainById: async (id: string): Promise<Train | undefined> => {
    await delay(300);
    const trains = loadTrains();
    return trains.find((t) => t.train_id === id);
  },
  
  // ✅ Update train
  updateTrain: async (id: string, data: Partial<CreateTrainTripDto>): Promise<Train | undefined> => {
    await delay(300);
    const trains = loadTrains();
    const index = trains.findIndex((t) => t.train_id === id);
    if (index !== -1) {
      trains[index] = { ...trains[index], ...data };
      saveTrains(trains);
      return trains[index];
    }
    return undefined;
  },
  
  // ✅ Delete train
  deleteTrain: async (id: string): Promise<boolean> => {
    await delay(300);
    const trains = loadTrains();
    const index = trains.findIndex((t) => t.train_id === id);
    if (index !== -1) {
      trains.splice(index, 1);
      saveTrains(trains);
      return true;
    }
    return false;
  },
};
