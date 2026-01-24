"use client";

import { useState, useEffect } from "react";
import { giftsApi } from "@/lib/api/gifts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    FolderOpen,
    Search,
    RefreshCw,
    Tag,
} from "lucide-react";

export default function GiftCategoriesPage() {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await giftsApi.getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setError("Failed to load gift categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter categories based on search
    const filteredCategories = categories.filter((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                        Gift Categories
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        View all available gift categories
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchCategories}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
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
                            placeholder="Search categories..."
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

            {/* Categories Grid */}
            {!loading && !error && (
                <>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <FolderOpen className="w-4 h-4" />
                        <span>
                            {filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"} found
                        </span>
                    </div>

                    {filteredCategories.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Tag className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-300 mb-2">
                                    No Categories Found
                                </h3>
                                <p className="text-slate-500">
                                    {searchQuery
                                        ? "No categories match your search"
                                        : "No gift categories available"}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredCategories.map((category, index) => (
                                <Card
                                    key={index}
                                    className="group hover:border-indigo-500/50 transition-all duration-200"
                                >
                                    <CardContent className="p-4 text-center">
                                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all">
                                            <Tag className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <h3 className="text-sm font-medium text-slate-200 truncate">
                                            {category}
                                        </h3>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
