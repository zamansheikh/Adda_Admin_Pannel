"use client";

import { useState, useEffect, useRef } from "react";
import { postersApi, CreatePosterData } from "@/lib/api/banners";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    FileImage,
    Plus,
    Search,
    RefreshCw,
    X,
    Upload,
    ExternalLink,
} from "lucide-react";

export default function PostersPage() {
    // Posters are now string[] (URLs only)
    const [posters, setPosters] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        alt: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPosters = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await postersApi.getPosters();
            setPosters(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch posters:", err);
            setError("Failed to load posters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosters();
    }, []);

    // Filter posters based on search (search in URL)
    const filteredPosters = posters.filter((url) =>
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

            await postersApi.createPoster({
                alt: formData.alt || "Poster",
                image: imageFile,
            });

            closeModal();
            fetchPosters();
        } catch (err) {
            console.error("Failed to save poster:", err);
            setError("Failed to save poster");
        } finally {
            setFormLoading(false);
        }
    };

    // Extract filename from URL for display
    const getFilenameFromUrl = (url: string): string => {
        try {
            const parts = url.split("/");
            return parts[parts.length - 1].substring(0, 25) + "...";
        } catch {
            return "Poster Image";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                        Posters
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage promotional posters for the app
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPosters}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={openCreateModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Poster
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
                            placeholder="Search posters..."
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

            {/* Posters Grid */}
            {!loading && (
                <>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <FileImage className="w-4 h-4" />
                        <span>
                            {filteredPosters.length} {filteredPosters.length === 1 ? "poster" : "posters"} found
                        </span>
                    </div>

                    {filteredPosters.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileImage className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-300 mb-2">
                                    No Posters Found
                                </h3>
                                <p className="text-slate-500 mb-4">
                                    {searchQuery
                                        ? "No posters match your search"
                                        : "No posters have been created yet"}
                                </p>
                                <Button onClick={openCreateModal}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Poster
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredPosters.map((url, index) => (
                                <Card
                                    key={index}
                                    className="group overflow-hidden hover:border-indigo-500/50 transition-all duration-200"
                                >
                                    {/* Poster Image - Vertical aspect ratio */}
                                    <div className="relative aspect-[3/4] bg-slate-800/50">
                                        <img
                                            src={url}
                                            alt={`Poster ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                                    <CardContent className="p-3">
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
                                Add Poster
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
                                    Poster Image <span className="text-red-400">*</span>
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative aspect-[3/4] max-h-64 mx-auto border-2 border-dashed border-slate-600 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-colors"
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
                                placeholder="Enter poster description"
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
                                    {formLoading ? "Uploading..." : "Upload Poster"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
