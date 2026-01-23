import apiClient from "./client";
import { ApiResponse } from "@/types";

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    activityZone: {
        zone: "safe" | "temp_block" | "permanent_block";
        createdAt?: string;
        expire?: string;
    };
    credit: number;
    userPoints: number;
    verified: boolean;
    avatar?: any;
    country?: string;
}

export interface UserStats {
    diamonds: number;
    stars: number;
}

export interface UpdateActivityZoneRequest {
    id: string;
    zone: "safe" | "temp_block" | "permanent_block";
    date_till?: string;
}

export interface AssignRoleRequest {
    userId: string;
}

export const usersApi = {
    /**
     * Get users by role
     */
    getUsersByRole: async (role: string, query?: Record<string, unknown>) => {
        const params = new URLSearchParams(query as any);
        const response = await apiClient.get<ApiResponse>(
            `/api/admin/user/asign-role/${role}?${params.toString()}`
        );
        return response.data.result;
    },

    /**
     * Assign role to user
     */
    assignRole: async (role: string, data: AssignRoleRequest) => {
        const response = await apiClient.put<ApiResponse>(
            `/api/admin/user/asign-role/${role}`,
            data
        );
        return response.data.result;
    },

    /**
     * Update user activity zone (block/unblock)
     */
    updateActivityZone: async (data: UpdateActivityZoneRequest) => {
        const response = await apiClient.put<ApiResponse>(
            "/api/admin/users/activity-zone",
            data
        );
        return response.data.result;
    },

    /**
     * Update user stats (stars/diamonds)
     */
    updateUserStats: async (userId: string, stats: Partial<UserStats>) => {
        const response = await apiClient.post<ApiResponse>(
            `/api/admin/users/stats/update/${userId}`,
            stats
        );
        return response.data.result;
    },

    /**
     * Get banned users
     */
    getBannedUsers: async (query?: Record<string, unknown>) => {
        const params = new URLSearchParams(query as any);
        const response = await apiClient.get<ApiResponse>(
            `/api/admin/users/banned-users?${params.toString()}`
        );
        return response.data.result;
    },

    /**
     * Get all moderators
     */
    getModerators: async (query?: Record<string, unknown>) => {
        const params = new URLSearchParams(query as any);
        const response = await apiClient.get<ApiResponse>(
            `/api/admin/users/moderators?${params.toString()}`
        );
        return response.data.result;
    },
};
