import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

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
}

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const driverService = {
    getAllDrivers: async (): Promise<Driver[]> => {
        const response = await axios.get(`${API_URL}/drivers/`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getDriver: async (id: number): Promise<Driver> => {
        const response = await axios.get(`${API_URL}/drivers/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    createDriver: async (driver: CreateDriverDto): Promise<Driver> => {
        const response = await axios.post(`${API_URL}/drivers/`, driver, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateDriver: async (id: number, driver: UpdateDriverDto): Promise<Driver> => {
        const response = await axios.put(`${API_URL}/drivers/${id}`, driver, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateDriverStatus: async (id: number, status: string): Promise<Driver> => {
        const response = await axios.put(`${API_URL}/drivers/${id}/status`, { status }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    deleteDriver: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/drivers/${id}`, {
            headers: getAuthHeader()
        });
    }
};