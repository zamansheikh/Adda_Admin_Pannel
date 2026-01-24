"use client";

import apiClient from "./client";

// ==================== Banners ====================
// Note: Backend GET returns String[] (array of URLs), but create/update require file upload

export interface CreateBannerData {
    alt: string;
    image: File;
}

export const bannersApi = {
    // Get all banners - returns array of URL strings
    getBanners: async (): Promise<string[]> => {
        const response = await apiClient.get("/api/admin/banners");
        return response.data.result || [];
    },

    // Create banner with image upload
    createBanner: async (data: CreateBannerData): Promise<unknown> => {
        const formData = new FormData();
        formData.append("alt", data.alt);
        formData.append("image", data.image);

        const response = await apiClient.post("/api/admin/banners", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.result || response.data;
    },

    // Update banner - Note: Backend may not have proper update support for string-based banners
    updateBanner: async (id: string, data: Partial<CreateBannerData>): Promise<unknown> => {
        const formData = new FormData();
        if (data.alt) formData.append("alt", data.alt);
        if (data.image) formData.append("image", data.image);

        const response = await apiClient.put(`/api/admin/banners/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.result || response.data;
    },

    // Delete banner
    deleteBanner: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/admin/banners/${id}`);
    },
};

// ==================== Posters ====================
// Note: Backend GET returns String[] (array of URLs)

export interface CreatePosterData {
    alt: string;
    image: File;
}

export const postersApi = {
    // Get all posters - returns array of URL strings
    getPosters: async (): Promise<string[]> => {
        const response = await apiClient.get("/api/admin/posters");
        return response.data.result || [];
    },

    // Create poster with image upload
    createPoster: async (data: CreatePosterData): Promise<unknown> => {
        const formData = new FormData();
        formData.append("alt", data.alt);
        formData.append("image", data.image);

        const response = await apiClient.post("/api/admin/posters", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.result || response.data;
    },

    // Update poster
    updatePoster: async (id: string, data: Partial<CreatePosterData>): Promise<unknown> => {
        const formData = new FormData();
        if (data.alt) formData.append("alt", data.alt);
        if (data.image) formData.append("image", data.image);

        const response = await apiClient.put(`/api/admin/posters/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.result || response.data;
    },

    // Delete poster
    deletePoster: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/admin/posters/${id}`);
    },
};
