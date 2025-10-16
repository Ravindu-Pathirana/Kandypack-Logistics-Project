import axios from 'axios';

const API_URL = 'http://localhost:8888';

export interface Driver {
    employee_id: number;
    name: string;
    phone: string;
    role: string;
    experience: string;
    current_route: string;
    current_location: string;
    status: string;
    weekly_hours: number;
    max_weekly_hours: number;
    rating: number;
    completed_deliveries: number;
    registrated_date: string;
}

export interface CreateDriverDto extends Omit<Driver, 'employee_id' | 'registrated_date'> {
    employee_nic: string;
    store_id: number;
    role_id: number;
}

export const driverService = {
    getAllDrivers: async (): Promise<Driver[]> => {
        const response = await axios.get(`${API_URL}/drivers/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    createDriver: async (driver: CreateDriverDto): Promise<Driver> => {
        const response = await axios.post(`${API_URL}/drivers/`, driver, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    updateDriverStatus: async (id: number, status: string): Promise<Driver> => {
        const response = await axios.put(`${API_URL}/drivers/${id}/status`, { status }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
};