// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    result: T;
    access_token?: string;
}

// User types
export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    avatar?: {
        url: string;
        thumbUrl: string;
    };
    coins?: number;
    createdAt: string;
    lastOnline?: string;
}

export enum UserRole {
    Admin = "admin",
    Merchant = "merchant",
    Agency = "agency",
    Host = "host",
    User = "user",
}

// Auth types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

// Portal User types
export interface PortalUser {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
    activityZone: ActivityZone;
}

export interface ActivityZone {
    zone: "safe" | "warning" | "restricted" | "banned";
    createdAt?: string;
    expire?: string;
}

// Gift types
export interface Gift {
    id: string;
    name: string;
    category: string;
    coinPrice: number;
    diamonds: number;
    previewImage: string;
    svgaImage: string;
}

// Banner/Poster types
export interface Banner {
    id: string;
    url: string;
    alt: string;
    isActive: boolean;
}

// Salary types
export interface Salary {
    id: string;
    diamondCount: number;
    moneyCount: number;
    country: string;
    type: string;
}

// Withdraw request types
export interface WithdrawRequest {
    id: string;
    userId: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    updatedAt: string;
}

// Dashboard stats types
export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    totalReels: number;
    totalRevenue: number;
    pendingWithdrawals: number;
}
