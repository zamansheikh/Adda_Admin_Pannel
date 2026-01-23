"use client";

import React, { useState, useEffect } from "react";
import { usersApi, User } from "@/lib/api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
    Users,
    Search,
    Filter,
    Ban,
    UserCog,
    Shield,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const USER_ROLES = ["admin", "merchant", "agency", "host", "user"];

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<any>(null);

    useEffect(() => {
        fetchUsers();
    }, [selectedRole]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            let response;
            if (selectedRole === "all") {
                // For "all", fetch from user role
                response = await usersApi.getUsersByRole("user", {
                    page: 1,
                    limit: 50,
                });
            } else {
                response = await usersApi.getUsersByRole(selectedRole, {
                    page: 1,
                    limit: 50,
                });
            }

            setUsers(response.users || []);
            setPagination(response.pagination || null);
        } catch (error: any) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getActivityZoneColor = (zone: string) => {
        switch (zone) {
            case "safe":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "temp_block":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            case "permanent_block":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const getActivityZoneLabel = (zone: string) => {
        switch (zone) {
            case "safe":
                return "Active";
            case "temp_block":
                return "Temp Blocked";
            case "permanent_block":
                return "Banned";
            default:
                return zone;
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
                    User Management
                </h1>
                <p className="text-sm md:text-base text-slate-400">
                    Manage users, roles, and activity zones
                </p>
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
                                    placeholder="Search by username or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <button
                                onClick={() => setSelectedRole("all")}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base",
                                    selectedRole === "all"
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                )}
                            >
                                All Users
                            </button>
                            {USER_ROLES.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg font-medium transition-all capitalize whitespace-nowrap text-sm md:text-base",
                                        selectedRole === role
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                        Users ({filteredUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-slate-500 mx-auto mb-4" />
                            <p className="text-slate-400">No users found</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">
                                                User
                                            </th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">
                                                Role
                                            </th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">
                                                Status
                                            </th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">
                                                Credits
                                            </th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user, index) => (
                                            <tr
                                                key={user.id || index}
                                                className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                            {user.username?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-200">
                                                                {user.username || "Unknown"}
                                                            </div>
                                                            <div className="text-sm text-slate-400">
                                                                {user.email || "No email"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 capitalize">
                                                        {user.userRole || "user"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={cn(
                                                            "px-3 py-1 rounded-full text-xs font-medium border",
                                                            getActivityZoneColor(
                                                                user.activityZone?.zone || "safe"
                                                            )
                                                        )}
                                                    >
                                                        {getActivityZoneLabel(
                                                            user.activityZone?.zone || "safe"
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-300">
                                                    {user.credit?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button size="sm" variant="outline">
                                                            <UserCog className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Ban className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="block md:hidden space-y-4">
                                {filteredUsers.map((user, index) => (
                                    <div
                                        key={user.id || index}
                                        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                {user.username?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-200 truncate">
                                                    {user.username || "Unknown"}
                                                </div>
                                                <div className="text-sm text-slate-400 truncate">
                                                    {user.email || "No email"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 capitalize">
                                                {user.userRole || "user"}
                                            </span>
                                            <span
                                                className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-medium border",
                                                    getActivityZoneColor(
                                                        user.activityZone?.zone || "safe"
                                                    )
                                                )}
                                            >
                                                {getActivityZoneLabel(
                                                    user.activityZone?.zone || "safe"
                                                )}
                                            </span>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                                                {user.credit?.toLocaleString() || 0} credits
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <UserCog className="w-4 h-4 mr-2" />
                                                Manage
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <Ban className="w-4 h-4 mr-2" />
                                                Block
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
