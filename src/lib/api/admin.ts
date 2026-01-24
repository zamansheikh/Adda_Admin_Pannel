
import apiClient from "./client";
import { ApiResponse } from "@/types";

export interface AdminProfile {
    _id: string;
    username: string;
    email: string;
    role: string;
    coins: number;
}

export const adminApi = {
    getProfile: async (): Promise<AdminProfile> => {
        const response = await apiClient.get<ApiResponse>("/api/admin/auth");
        return response.data.result;
    },

    assignCoins: async (coins: number): Promise<AdminProfile> => {
        const response = await apiClient.put<ApiResponse>("/api/admin/auth/assign-coin", { coins });
        return response.data.result;
    },

    updateProfile: async (data: Partial<AdminProfile> & { password?: string }): Promise<AdminProfile> => {
        const response = await apiClient.put<ApiResponse>("/api/admin/auth", data);
        return response.data.result;
    }
};
