import apiClient from "./client";
import { ApiResponse, LoginRequest, LoginResponse } from "@/types";

export const authApi = {
    /**
     * Login admin user
     */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<ApiResponse<any>>(
            "/api/admin/login",
            credentials
        );

        const { result, access_token } = response.data;
        const user = Array.isArray(result) ? result[0] : result;

        return {
            user,
            token: access_token || "",
        };
    },

    /**
     * Get current admin profile
     */
    getProfile: async () => {
        const response = await apiClient.get<ApiResponse>("/api/admin/profile");
        return response.data.result;
    },

    /**
     * Logout admin user
     */
    logout: () => {
        // Clear local storage
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
        }
    },
};
