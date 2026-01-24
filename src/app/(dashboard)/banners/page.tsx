"use client";

import { useState, useEffect, useRef } from "react";
import { bannersApi, CreateBannerData } from "@/lib/api/banners";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    Image as ImageIcon,
    Plus,
    Search,
    RefreshCw,
    Trash2,
    X,
    Upload,
    ExternalLink,
} from "lucide-react";

export default function BannersPage() {
    // Banners are now string[] (URLs only)
    const [banners, setBanners] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        alt: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await bannersApi.getBanners();
            setBanners(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch banners:", err);
            setError("Failed to load banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // Filter banners based on search (search in URL)
    const filteredBanners = banners.filter((url) =>
        url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCreateModal = () => {
        setFormData({ alt: "" });
        setImageFile(null);
        setImagePreview("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ alt: "" });
        setImageFile(null);
        setImagePreview("");
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageFile) {
            setError("Please select an image");
            return;
        }

        try {
            setFormLoading(true);
            setError("");

            await bannersApi.createBanner({
                alt: formData.alt || "Banner",
                image: imageFile,
            });

            closeModal();
            fetchBanners();
        } catch (err) {
            console.error("Failed to save banner:", err);
            setError("Failed to save banner");
        } finally {
            setFormLoading(false);
        }
    };

    // Extract filename from URL for display
    const getFilenameFromUrl = (url: string): string => {
        try {
            const parts = url.split("/");
            return parts[parts.length - 1].substring(0, 30) + "...";
        } catch {
            return "Banner Image";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                        Banners
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage promotional banners for the app
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchBanners}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={openCreateModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Banner
                    </Button>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search banners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
            )}

            {/* Banners Grid */}
            {!loading && (
                <>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <ImageIcon className="w-4 h-4" />
                        <span>
                            {filteredBanners.length} {filteredBanners.length === 1 ? "banner" : "banners"} found
                        </span>
                    </div>

                    {filteredBanners.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-300 mb-2">
                                    No Banners Found
                                </h3>
                                <p className="text-slate-500 mb-4">
                                    {searchQuery
                                        ? "No banners match your search"
                                        : "No banners have been created yet"}
                                </p>
                                <Button onClick={openCreateModal}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Banner
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBanners.map((url, index) => (
                                <Card
                                    key={index}
                                    className="group overflow-hidden hover:border-indigo-500/50 transition-all duration-200"
                                >
                                    {/* Banner Image */}
                                    <div className="relative aspect-[16/9] bg-slate-800/50">
                                        <img
                                            src={url}
                                            alt={`Banner ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center h-10 w-10 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="w-5 h-5 text-slate-200" />
                                            </a>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <p className="text-xs text-slate-400 truncate" title={url}>
                                            {getFilenameFromUrl(url)}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-100">
                                Add Banner
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Banner Image <span className="text-red-400">*</span>
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative aspect-[16/9] border-2 border-dashed border-slate-600 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-colors"
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                            <Upload className="w-8 h-8 mb-2" />
                                            <span className="text-sm">Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Alt Text (optional for description) */}
                            <Input
                                label="Description (optional)"
                                placeholder="Enter banner description"
                                value={formData.alt}
                                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                            />

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={formLoading}
                                >
                                    {formLoading ? "Uploading..." : "Upload Banner"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
