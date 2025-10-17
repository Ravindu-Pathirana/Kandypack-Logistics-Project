import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888";

export const orderService = {
  getAllOrders: async () => {
    const res = await axios.get(`${API_URL}/orders`);
    return res.data;
  },
  updateStatus: async (id: string, status: string) => {
    await axios.patch(`${API_URL}/orders/${id}`, { status });
  },
};
