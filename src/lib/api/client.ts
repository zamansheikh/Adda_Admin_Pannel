import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("auth_token");
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle 401 Unauthorized - Auto logout
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
                // Redirect to login
                window.location.href = "/login";
            }
        }

        // Handle other errors
        const errorMessage =
            (error.response?.data as any)?.message ||
            error.message ||
            "An unexpected error occurred";

        return Promise.reject(new Error(errorMessage));
    }
);

export default apiClient;
