"use client";

import apiClient from "./client";
import { ApiResponse } from "@/types";

// User roles available in the system
export const USER_ROLES = [
    { value: "admin", label: "Admin", color: "bg-red-500" },
    { value: "merchant", label: "Merchant", color: "bg-amber-500" },
    { value: "agency", label: "Agency", color: "bg-blue-500" },
    { value: "host", label: "Host", color: "bg-purple-500" },
    { value: "user", label: "User", color: "bg-slate-500" },
] as const;

// Activity zone types
export const ACTIVITY_ZONES = [
    { value: "safe", label: "Active", color: "bg-green-500" },
    { value: "temp_block", label: "Temp Blocked", color: "bg-orange-500" },
    { value: "permanent_block", label: "Permanently Banned", color: "bg-red-500" },
] as const;

export interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    activityZone?: string;
    activityZoneTill?: string;
    stars?: number;
    diamonds?: number;
    profileImage?: string;
    createdAt?: string;
}

export interface AssignRoleData {
    userId: string;
}

export interface UpdateActivityZoneData {
    userId: string;
    zone: "safe" | "temp_block" | "permanent_block";
    dateTill?: string; // ISO date string for temp_block
}

export interface UpdateStatsData {
    stars?: number;
    diamonds?: number;
}

export const rolesApi = {
    /**
     * Get users by role
     */
    getUsersByRole: async (role: string, query?: Record<string, unknown>): Promise<User[]> => {
        const params = new URLSearchParams(query as Record<string, string>);
        const response = await apiClient.get<ApiResponse>(
            `/api/admin/user/asign-role/${role}?${params.toString()}`
        );
        return response.data.result || [];
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
     */
    updateUserStats: async (userId: string, data: UpdateStatsData): Promise<User> => {
        const response = await apiClient.post<ApiResponse>(
            `/api/admin/users/stats/update/${userId}`,
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
};
