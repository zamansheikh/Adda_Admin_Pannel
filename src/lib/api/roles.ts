"use client";

import apiClient from "./client";
import { ApiResponse } from "@/types";

// User roles available in the system
// Mapped to match backend UserRoles enum (sub-admin, re-seller, etc.)
export const USER_ROLES = [
    { value: "admin", label: "Admin", color: "bg-red-500" },
    { value: "sub-admin", label: "Sub Admin", color: "bg-rose-500" },
    { value: "merchant", label: "Merchant", color: "bg-amber-500" },
    { value: "re-seller", label: "Reseller", color: "bg-yellow-500" },
    { value: "agency", label: "Agency", color: "bg-blue-500" },
    { value: "host", label: "Host", color: "bg-purple-500" },
    { value: "user", label: "User", color: "bg-slate-500" },
    { value: "country-admin", label: "Country Admin", color: "bg-teal-500" },
    { value: "country-sub-admin", label: "Country Sub Admin", color: "bg-cyan-500" },
] as const;

// Activity zone types
export const ACTIVITY_ZONES = [
    { value: "safe", label: "Active", color: "bg-green-500" },
    { value: "temp_block", label: "Temp Blocked", color: "bg-orange-500" },
    { value: "permanent_block", label: "Permanently Banned", color: "bg-red-500" },
] as const;

export interface UserStats {
    _id?: string;
    userId?: string;
    coins?: number;
    diamonds?: number;
    stars?: number;
    // Add other stat fields if they exist
}

export interface User {
    _id: string;
    id?: string;
    username?: string;
    name?: string;
    email?: string;
    userRole?: string;
    role?: string;
    activityZone?: {
        zone?: string;
        expire?: string;
    };
    // Derived/Root level fields
    totalBoughtCoins?: number;
    credit?: number;
    profileImage?: string;
    avatar?: string;
    createdAt?: string;
    level?: number;

    // Populated stats from lookup
    stats?: UserStats;

    // Legacy fields (might be deprecated, check usage)
    stars?: number;
    diamonds?: number;
    coins?: number;
}

export interface AssignRoleData {
    userId: string;
    // role is passed in URL
}

export interface UpdateActivityZoneData {
    id: string;
    zone: "safe" | "temp_block" | "permanent_block";
    dateTill?: string; // ISO date string for temp_block
}

export interface UpdateStatsData {
    stars?: number;
    diamonds?: number;
}

export interface AssignCoinsData {
    userId: string;
    coins: number;
    userRole: string;
}

export const rolesApi = {
    /**
     * Get users by role (or all users if role is "all")
     * Uses /api/power-shared/users to ensure stats are populated
     */
    getUsersByRole: async (role: string, query?: Record<string, unknown>): Promise<{ users: User[], pagination?: unknown }> => {
        const params = new URLSearchParams(query as Record<string, string>);

        // Only append userRole if it's not "all"
        if (role !== "all") {
            params.append("userRole", role);
        }

        const response = await apiClient.get<ApiResponse>(
            `/api/power-shared/users?${params.toString()}`
        );

        // Handle different response formats
        if (Array.isArray(response.data.result)) {
            return { users: response.data.result, pagination: null };
        }

        // The repository returns { users: [], pagination: ... }
        return response.data.result || { users: [], pagination: null };
    },

    /**
     * Assign role to user
     */
    assignRole: async (role: string, data: AssignRoleData): Promise<User> => {
        const response = await apiClient.put<ApiResponse>(
            `/api/admin/user/asign-role/${role}`,
            data
        );
        return response.data.result;
    },

    /**
     * Update user activity zone (block/unblock)
     */
    updateActivityZone: async (data: UpdateActivityZoneData): Promise<User> => {
        const response = await apiClient.put<ApiResponse>(
            "/api/admin/users/activity-zone",
            data
        );
        return response.data.result;
    },

    /**
     * Update user stats (stars/diamonds)
     * POST /api/admin/users/stats/update/:userId
     * Body: { diamonds?: number, stars?: number }
     */
    updateUserStats: async (userId: string, data: UpdateStatsData): Promise<UserStats> => {
        const response = await apiClient.post<ApiResponse>(
            `/api/admin/users/stats/update/${userId}`,
            data
        );
        return response.data.result;
    },

    /**
     * Assign coins to user (from admin's coin balance)
     * PUT /api/power-shared/users/assign-coin
     * Body: { userId, coins, userRole }
     * Note: Admin can only assign to Merchant, Merchant to Reseller/User, Reseller to User
     */
    assignCoins: async (data: AssignCoinsData): Promise<UserStats> => {
        const response = await apiClient.put<ApiResponse>(
            "/api/power-shared/users/assign-coin",
            data
        );
        return response.data.result;
    },

    /**
     * Get all moderators
     */
    getModerators: async (): Promise<User[]> => {
        const response = await apiClient.get<ApiResponse>("/api/admin/users/moderators");
        return response.data.result || [];
    },

    /**
     * Search users by email
     */
    searchUsers: async (email: string, query?: Record<string, unknown>): Promise<{ users: User[], pagination?: unknown }> => {
        const params = new URLSearchParams({ email, ...(query as Record<string, string>) });
        const response = await apiClient.get<ApiResponse>(
            `/api/power-shared/users/search?${params.toString()}`
        );
        return response.data.result || { users: [], pagination: null };
    },

    /**
     * Get all users with pagination
     * (Alias for getUsersByRole('all'))
     */
    getAllUsers: async (query?: Record<string, unknown>): Promise<{ users: User[], pagination?: unknown }> => {
        return rolesApi.getUsersByRole("all", query);
    },
};
