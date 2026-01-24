"use client";

import React, { useState, useEffect, useRef } from "react";
import { giftsApi, Gift, CreateGiftData } from "@/lib/api/gifts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    Gift as GiftIcon,
    Plus,
    Trash2,
    Edit,
    X,
    Upload,
    Diamond,
    Coins,
    Search,
    AlertCircle,
    Image,
    FileVideo,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function GiftsPage() {
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGift, setEditingGift] = useState<Gift | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        diamonds: "",
        coinPrice: "",
    });
    const [previewImage, setPreviewImage] = useState<File | null>(null);
    const [svgaImage, setSvgaImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const previewInputRef = useRef<HTMLInputElement>(null);
    const svgaInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchGifts();
        fetchCategories();
    }, []);

    const fetchGifts = async () => {
        try {
            setIsLoading(true);
            const data = await giftsApi.getGifts();
            setGifts(data);
        } catch (error: any) {
            console.error("Error fetching gifts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const cats = await giftsApi.getCategories();
            setCategories(cats);
        } catch (error: any) {
            console.error("Error fetching categories:", error);
        }
    };

    const filteredGifts = gifts.filter((gift) => {
        const matchesCategory =
            selectedCategory === "all" || gift.category === selectedCategory;
        const matchesSearch =
            gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gift.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const openModal = (gift?: Gift) => {
        if (gift) {
            setEditingGift(gift);
            setFormData({
                name: gift.name,
                category: gift.category,
                diamonds: gift.diamonds.toString(),
                coinPrice: gift.coinPrice.toString(),
            });
            setPreviewUrl(gift.previewImage);
        } else {
            setEditingGift(null);
            setFormData({
                name: "",
                category: "",
                diamonds: "",
                coinPrice: "",
            });
            setPreviewUrl("");
        }
        setPreviewImage(null);
        setSvgaImage(null);
        setError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGift(null);
        setError("");
    };

    const handlePreviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSvgaImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSvgaImage(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.name.trim()) {
            setError("Gift name is required");
            return;
        }
        if (!formData.category.trim()) {
            setError("Category is required");
            return;
        }
        if (!formData.diamonds || isNaN(Number(formData.diamonds))) {
            setError("Valid diamonds value is required");
            return;
        }
        if (!formData.coinPrice || isNaN(Number(formData.coinPrice))) {
            setError("Valid coin price is required");
            return;
        }

        if (!editingGift) {
            if (!previewImage) {
                setError("Preview image is required");
                return;
            }
            if (!svgaImage) {
                setError("SVGA animation file is required");
                return;
            }
        }

        try {
            setIsSubmitting(true);

            if (editingGift) {
                await giftsApi.updateGift(editingGift._id, {
                    name: formData.name,
                    category: formData.category,
                    diamonds: Number(formData.diamonds),
                    coinPrice: Number(formData.coinPrice),
                    previewImage: previewImage || undefined,
                    svgaImage: svgaImage || undefined,
                });
            } else {
                await giftsApi.createGift({
                    name: formData.name,
                    category: formData.category,
                    diamonds: Number(formData.diamonds),
                    coinPrice: Number(formData.coinPrice),
                    previewImage: previewImage!,
                    svgaImage: svgaImage!,
                });
            }

            await fetchGifts();
            await fetchCategories();
            closeModal();
        } catch (error: any) {
            console.error("Error saving gift:", error);
            setError(error.response?.data?.message || "Failed to save gift");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (gift: Gift) => {
        if (!confirm(`Are you sure you want to delete "${gift.name}"?`)) return;

        try {
            setIsDeleting(gift._id);
            await giftsApi.deleteGift(gift._id);
            await fetchGifts();
        } catch (error: any) {
            console.error("Error deleting gift:", error);
            alert(error.response?.data?.message || "Failed to delete gift");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
                        Gift Management
                    </h1>
                    <p className="text-sm md:text-base text-slate-400">
                        Create, edit, and manage virtual gifts
                    </p>
                </div>
                <Button onClick={() => openModal()} className="w-full md:w-auto">
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Gift
                </Button>
            </div>

            {/* Filters */}
            <Card variant="glass">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search gifts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <button
                                onClick={() => setSelectedCategory("all")}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm",
                                    selectedCategory === "all"
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                )}
                            >
                                All Gifts
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm capitalize",
                                        selectedCategory === category
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gifts Grid */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                        <GiftIcon className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                        Gifts ({filteredGifts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : filteredGifts.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-slate-500 mx-auto mb-4" />
                            <p className="text-slate-400">No gifts found</p>
                            <Button onClick={() => openModal()} variant="outline" className="mt-4">
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Gift
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredGifts.map((gift) => (
                                <div
                                    key={gift._id}
                                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-indigo-500/50 transition-all group"
                                >
                                    {/* Gift Image */}
                                    <div className="aspect-square rounded-lg bg-slate-900 mb-3 overflow-hidden relative">
                                        <img
                                            src={gift.previewImage}
                                            alt={gift.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    "https://via.placeholder.com/100?text=Gift";
                                            }}
                                        />
                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openModal(gift)}
                                                className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                <Edit className="w-4 h-4 text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(gift)}
                                                disabled={isDeleting === gift._id}
                                                className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                            >
                                                {isDeleting === gift._id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 text-white" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Gift Info */}
                                    <h3 className="font-medium text-slate-200 text-sm truncate mb-1">
                                        {gift.name}
                                    </h3>
                                    <p className="text-xs text-slate-400 capitalize mb-2">
                                        {gift.category}
                                    </p>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1 text-blue-400">
                                            <Diamond className="w-3 h-3" />
                                            {gift.diamonds}
                                        </span>
                                        <span className="flex items-center gap-1 text-yellow-400">
                                            <Coins className="w-3 h-3" />
                                            {gift.coinPrice}
                                        </span>
                                    </div>
                                    {gift.sendCount !== undefined && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Sent: {gift.sendCount} times
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-xl font-semibold text-slate-100">
                                {editingGift ? "Edit Gift" : "Create New Gift"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Name */}
                            <Input
                                label="Gift Name"
                                placeholder="Enter gift name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter category (e.g., love, fun, luxury)"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    list="categories"
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <datalist id="categories">
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            </div>

                            {/* Diamonds & Coin Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Diamonds"
                                    type="number"
                                    placeholder="0"
                                    value={formData.diamonds}
                                    onChange={(e) =>
                                        setFormData({ ...formData, diamonds: e.target.value })
                                    }
                                />
                                <Input
                                    label="Coin Price"
                                    type="number"
                                    placeholder="0"
                                    value={formData.coinPrice}
                                    onChange={(e) =>
                                        setFormData({ ...formData, coinPrice: e.target.value })
                                    }
                                />
                            </div>

                            {/* Preview Image */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Preview Image {!editingGift && "*"}
                                </label>
                                <input
                                    type="file"
                                    ref={previewInputRef}
                                    onChange={handlePreviewImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => previewInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 rounded-lg p-4 cursor-pointer hover:border-indigo-500 transition-colors"
                                >
                                    {previewUrl ? (
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-16 h-16 object-contain rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-300">
                                                    {previewImage?.name || "Current image"}
                                                </p>
                                                <p className="text-xs text-slate-500">Click to change</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Image className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                            <p className="text-sm text-slate-400">
                                                Click to upload preview image
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SVGA Animation */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    SVGA Animation {!editingGift && "*"}
                                </label>
                                <input
                                    type="file"
                                    ref={svgaInputRef}
                                    onChange={handleSvgaImageChange}
                                    accept=".svga,.gif"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => svgaInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 rounded-lg p-4 cursor-pointer hover:border-indigo-500 transition-colors"
                                >
                                    {svgaImage ? (
                                        <div className="flex items-center gap-4">
                                            <FileVideo className="w-12 h-12 text-indigo-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-300">{svgaImage.name}</p>
                                                <p className="text-xs text-slate-500">Click to change</p>
                                            </div>
                                        </div>
                                    ) : editingGift ? (
                                        <div className="flex items-center gap-4">
                                            <FileVideo className="w-12 h-12 text-green-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-300">Animation uploaded</p>
                                                <p className="text-xs text-slate-500">Click to replace</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                            <p className="text-sm text-slate-400">
                                                Click to upload SVGA/GIF animation
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    className="flex-1"
                                >
                                    {editingGift ? "Update Gift" : "Create Gift"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
