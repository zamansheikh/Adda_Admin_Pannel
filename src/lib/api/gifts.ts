import apiClient from "./client";
import { ApiResponse } from "@/types";

export interface Gift {
    _id: string;
    name: string;
    category: string;
    sendCount?: number;
    diamonds: number;
    coinPrice: number;
    previewImage: string;
    svgaImage: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateGiftData {
    name: string;
    category: string;
    diamonds: number;
    coinPrice: number;
    previewImage: File;
    svgaImage: File;
}

export interface UpdateGiftData {
    name?: string;
    category?: string;
    diamonds?: number;
    coinPrice?: number;
    previewImage?: File;
    svgaImage?: File;
}

export const giftsApi = {
    /**
     * Get all gifts
     */
    getGifts: async (query?: Record<string, unknown>): Promise<Gift[]> => {
        const params = new URLSearchParams(query as any);
        const response = await apiClient.get<ApiResponse>(
            `/api/admin/gift?${params.toString()}`
        );
        return response.data.result || [];
    },

    /**
     * Get gift categories
     */
    getCategories: async (): Promise<string[]> => {
        const response = await apiClient.get<ApiResponse>("/api/admin/gift-category");
        return response.data.result || [];
    },

    /**
     * Create a new gift
     */
    createGift: async (data: CreateGiftData): Promise<Gift> => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("category", data.category);
        formData.append("diamonds", data.diamonds.toString());
        formData.append("coinPrice", data.coinPrice.toString());
        formData.append("previewImage", data.previewImage);
        formData.append("svgaImage", data.svgaImage);

        const response = await apiClient.post<ApiResponse>("/api/admin/gift", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.result;
    },

    /**
     * Update an existing gift
     */
    updateGift: async (id: string, data: UpdateGiftData): Promise<Gift> => {
        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (data.category) formData.append("category", data.category);
        if (data.diamonds !== undefined) formData.append("diamonds", data.diamonds.toString());
        if (data.coinPrice !== undefined) formData.append("coinPrice", data.coinPrice.toString());
        if (data.previewImage) formData.append("previewImage", data.previewImage);
        if (data.svgaImage) formData.append("svgaImage", data.svgaImage);

        const response = await apiClient.put<ApiResponse>(`/api/admin/gift/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.result;
    },

    /**
     * Delete a gift
     */
    deleteGift: async (id: string): Promise<Gift> => {
        const response = await apiClient.delete<ApiResponse>(`/api/admin/gift/${id}`);
        return response.data.result;
    },
};
