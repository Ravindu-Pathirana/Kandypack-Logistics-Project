import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888";

export interface Order {
  id: string;
  customer: string;
  customerType?: string;
  destination: string;
  route: string;
  orderDate: string;
  deliveryDate: string;
  items: number;
  totalValue: string;
  weight: string;
  status: string;
  trainTrip: string;
  driver: string;
}

export interface CreateOrderDto {
  customer: string;
  destination: string;
  items: number;
  totalValue: string;
  weight: string;
  status?: string;
}

export const orderService = {
  getAllOrders: async (): Promise<Order[]> => {
    const res = await axios.get(`${API_URL}/orders`);
    return res.data;
  },
  
  createOrder: async (data: CreateOrderDto): Promise<Order> => {
    const res = await axios.post(`${API_URL}/orders`, data);
    return res.data;
  },
  
  updateStatus: async (id: string, status: string): Promise<void> => {
    await axios.patch(`${API_URL}/orders/${id}`, { status });
  },
  
  getOrderById: async (id: string): Promise<Order> => {
    const res = await axios.get(`${API_URL}/orders/${id}`);
    return res.data;
  },
};
