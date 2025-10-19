import axios from "axios";
import { StaffForm } from "@/pages/AddStaffMember";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888";
const STORAGE_KEY = 'kandypack_drivers';
const USE_LOCAL_STORAGE = true; // Set to false to use real API

export interface Driver {
  employee_id: number;
  employee_name: string;
  employee_nic: string;
  official_contact_number: string;
  role_id: number;
  store_id: number;
  status: string;
  total_hours_week: number;
  registrated_date: string;
  role: string;
  current_route?: string;
  current_location?: string;
  rating?: number;
  completed_deliveries?: number;
  experience?: string;
  weeklyHours?: number;
  maxWeeklyHours?: number;
  lastTrip?: string;
  completedDeliveries?: number;
  phone?: string;
}

export interface CreateDriverDto {
  employee_name: string;
  employee_nic: string;
  official_contact_number: string;
  role_id: number;
  store_id: number;
  status?: string;
  total_hours_week?: number;
  auth_id?: number;
}

export interface UpdateDriverDto {
  employee_name?: string;
  official_contact_number?: string;
  status?: string;
  total_hours_week?: number;
  current_route?: string;
  current_location?: string;
}

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Initial mock drivers
const initialDrivers: Driver[] = [
  {
    employee_id: 1,
    employee_name: "Kamal Perera",
    employee_nic: "199012345678",
    official_contact_number: "+94 77 123 4567",
    role_id: 1,
    store_id: 1,
    status: "On Duty",
    total_hours_week: 35,
    registrated_date: "2024-01-15",
    role: "Driver",
    current_route: "R-01",
    current_location: "Colombo",
    rating: 4.8,
    completed_deliveries: 1247,
    experience: "8 years",
    weeklyHours: 35,
    maxWeeklyHours: 40,
    lastTrip: "2024-08-07 14:30",
    completedDeliveries: 1247,
    phone: "+94 77 123 4567",
  },
  {
    employee_id: 2,
    employee_name: "Sunil Fernando",
    employee_nic: "198512345679",
    official_contact_number: "+94 77 234 5678",
    role_id: 1,
    store_id: 1,
    status: "Off Duty",
    total_hours_week: 38,
    registrated_date: "2023-06-20",
    role: "Driver",
    current_route: "R-05",
    current_location: "Matara",
    rating: 4.9,
    completed_deliveries: 2156,
    experience: "12 years",
    weeklyHours: 38,
    maxWeeklyHours: 40,
    lastTrip: "2024-08-07 16:45",
    completedDeliveries: 2156,
    phone: "+94 77 234 5678",
  },
];

// Helper functions for localStorage
const loadDrivers = (): Driver[] => {
  if (!USE_LOCAL_STORAGE) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading drivers from localStorage:', error);
  }
  // Initialize with default data if nothing in storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDrivers));
  return initialDrivers;
};

const saveDrivers = (drivers: Driver[]): void => {
  if (!USE_LOCAL_STORAGE) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
  } catch (error) {
    console.error('Error saving drivers to localStorage:', error);
  }
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const driverService = {
  // ✅ 1. Get all drivers
  getAllDrivers: async (): Promise<Driver[]> => {
    if (USE_LOCAL_STORAGE) {
      await delay(300);
      return loadDrivers();
    }
    const response = await axios.get(`${API_URL}/drivers/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // ✅ 2. Get one driver
  getDriver: async (id: number): Promise<Driver> => {
    if (USE_LOCAL_STORAGE) {
      await delay(300);
      const drivers = loadDrivers();
      const driver = drivers.find((d) => d.employee_id === id);
      if (!driver) throw new Error('Driver not found');
      return driver;
    }
    const response = await axios.get(`${API_URL}/drivers/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // ✅ 3. Create new driver
  createDriver: async (data: StaffForm): Promise<Driver> => {
    if (USE_LOCAL_STORAGE) {
      await delay(500);
      const drivers = loadDrivers();
      const newDriver: Driver = {
        employee_id: drivers.length > 0 ? Math.max(...drivers.map(d => d.employee_id)) + 1 : 1,
        employee_name: data.employee_name,
        employee_nic: "000000000000", // Default placeholder
        official_contact_number: data.official_contact_number,
        role_id: data.role === "Assistant" ? 2 : 1,
        store_id: 1,
        status: data.status || "On Duty",
        total_hours_week: 0,
        registrated_date: new Date().toISOString().split('T')[0],
        role: data.role || "Driver",
        current_route: data.current_route || "Unassigned",
        current_location: "Kandy",
        rating: 0,
        completed_deliveries: 0,
        experience: "New",
        weeklyHours: 0,
        maxWeeklyHours: data.role === "Assistant" ? 60 : 40,
        lastTrip: "N/A",
        completedDeliveries: 0,
        phone: data.official_contact_number,
      };
      const updatedDrivers = [...drivers, newDriver];
      saveDrivers(updatedDrivers);
      return newDriver;
    }
    const response = await axios.post(`${API_URL}/drivers`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // ✅ 4. Update driver
  updateDriver: async (id: number, driver: UpdateDriverDto): Promise<Driver> => {
    if (USE_LOCAL_STORAGE) {
      await delay(300);
      const drivers = loadDrivers();
      const index = drivers.findIndex((d) => d.employee_id === id);
      if (index !== -1) {
        drivers[index] = { ...drivers[index], ...driver };
        saveDrivers(drivers);
        return drivers[index];
      }
      throw new Error('Driver not found');
    }
    const response = await axios.put(`${API_URL}/drivers/${id}`, driver, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // ✅ 5. Update status
  updateDriverStatus: async (id: number, status: string): Promise<Driver> => {
    if (USE_LOCAL_STORAGE) {
      await delay(300);
      const drivers = loadDrivers();
      const index = drivers.findIndex((d) => d.employee_id === id);
      if (index !== -1) {
        drivers[index].status = status;
        saveDrivers(drivers);
        return drivers[index];
      }
      throw new Error('Driver not found');
    }
    const response = await axios.put(
      `${API_URL}/drivers/${id}/status`,
      { status },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // ✅ 6. Delete driver
  deleteDriver: async (id: number): Promise<void> => {
    if (USE_LOCAL_STORAGE) {
      await delay(300);
      const drivers = loadDrivers();
      const index = drivers.findIndex((d) => d.employee_id === id);
      if (index !== -1) {
        drivers.splice(index, 1);
        saveDrivers(drivers);
        return;
      }
      throw new Error('Driver not found');
    }
    await axios.delete(`${API_URL}/drivers/${id}`, {
      headers: getAuthHeader(),
    });
  },
};
