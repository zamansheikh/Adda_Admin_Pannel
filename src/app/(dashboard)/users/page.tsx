"use client";

import React, { useState, useEffect } from "react";
import { rolesApi, User, USER_ROLES, ACTIVITY_ZONES } from "@/lib/api/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    Users,
    Search,
    Ban,
    UserCog,
    AlertCircle,
    RefreshCw,
    X,
    Check,
    Star,
    Diamond,
    Coins,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ROLE_OPTIONS = ["all", ...USER_ROLES.map(r => r.value)];

// Helper to safely get stats
const getStats = (user: User) => {
    return {
        stars: user.stats?.stars || user.stars || 0,
        diamonds: user.stats?.diamonds || user.diamonds || 0,
        coins: user.stats?.coins || user.totalBoughtCoins || user.coins || 0
    };
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>("user");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Modal states
    const [activeModal, setActiveModal] = useState<{
        type: "role" | "zone" | "stats" | null;
        user: User | null;
    }>({ type: null, user: null });
    const [modalLoading, setModalLoading] = useState(false);

    // Form states
    const [newRole, setNewRole] = useState("");
    const [newZone, setNewZone] = useState<"safe" | "temp_block" | "permanent_block">("safe");
    const [zoneTillDate, setZoneTillDate] = useState("");
    const [statsForm, setStatsForm] = useState({ stars: 0, diamonds: 0 });

    useEffect(() => {
        fetchUsers();
    }, [selectedRole]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError("");
            // If "all" is selected, we pass "all" which rolesApi handles by not sending userRole param
            const response = await rolesApi.getUsersByRole(selectedRole, {
                page: "1",
                limit: "50",
            });
            setUsers(response.users || []);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.message || "Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter((user) =>
        (user.username || user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getActivityZoneColor = (zone?: string) => {
        const found = ACTIVITY_ZONES.find(z => z.value === zone);
        return found?.color || "bg-green-500";
    };

    const getActivityZoneLabel = (zone?: string) => {
        const found = ACTIVITY_ZONES.find(z => z.value === zone);
        return found?.label || "Active";
    };

    const getRoleColor = (role?: string) => {
        const found = USER_ROLES.find(r => r.value === role);
        return found?.color || "bg-slate-500";
    };

    const openRoleModal = (user: User) => {
        setNewRole(user.userRole || user.role || "user");
        setActiveModal({ type: "role", user });
    };

    const openZoneModal = (user: User) => {
        const currentZone = user.activityZone?.zone || "safe";
        setNewZone(currentZone as typeof newZone);
        setZoneTillDate("");
        setActiveModal({ type: "zone", user });
    };

    const openStatsModal = (user: User) => {
        const stats = getStats(user);
        setStatsForm({
            stars: stats.stars,
            diamonds: stats.diamonds,
        });
        setActiveModal({ type: "stats", user });
    };

    const closeModal = () => {
        setActiveModal({ type: null, user: null });
        setModalLoading(false);
    };

    const handleRoleChange = async () => {
        if (!activeModal.user) return;
        try {
            setModalLoading(true);
            await rolesApi.assignRole(newRole, { userId: activeModal.user._id });
            closeModal();
            fetchUsers();
        } catch (err: any) {
            console.error("Failed to assign role:", err);
            setError(err.message || "Failed to assign role");
        } finally {
            setModalLoading(false);
        }
    };

    const handleZoneChange = async () => {
        if (!activeModal.user) return;
        try {
            setModalLoading(true);
            await rolesApi.updateActivityZone({
                id: activeModal.user._id,
                zone: newZone,
                ...(newZone === "temp_block" && zoneTillDate ? { dateTill: new Date(zoneTillDate).toISOString() } : {}),
            });
            closeModal();
            fetchUsers();
        } catch (err: any) {
            console.error("Failed to update activity zone:", err);
            setError(err.message || "Failed to update activity zone");
        } finally {
            setModalLoading(false);
        }
    };

    const handleStatsUpdate = async () => {
        if (!activeModal.user) return;
        try {
            setModalLoading(true);
            await rolesApi.updateUserStats(activeModal.user._id, statsForm);
            closeModal();
            fetchUsers();
        } catch (err: any) {
            console.error("Failed to update stats:", err);
            setError(err.message || "Failed to update user stats");
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
                        User Management
                    </h1>
                    <p className="text-sm md:text-base text-slate-400">
                        Manage users, roles, activity zones, and credits
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={isLoading}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
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
                                    placeholder="Search by username or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <button
                                onClick={() => setSelectedRole("all")}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm",
                                    selectedRole === "all"
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                )}
                            >
                                All
                            </button>
                            {USER_ROLES.map((role) => (
                                <button
                                    key={role.value}
                                    onClick={() => setSelectedRole(role.value)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm",
                                        selectedRole === role.value
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                    {error}
                    <button onClick={() => setError("")} className="ml-2 text-red-300 hover:text-red-200">×</button>
                </div>
            )}

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
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
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
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">User</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Role</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Status</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Credits</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user, index) => (
                                            <tr
                                                key={user._id || user.id || index}
                                                className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                            {(user.username || user.name || "U").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-200">
                                                                {user.username || user.name || "Unknown"}
                                                            </div>
                                                            <div className="text-sm text-slate-400">
                                                                {user.email || "No email"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-medium text-white capitalize",
                                                        getRoleColor(user.userRole || user.role)
                                                    )}>
                                                        {user.userRole || user.role || "user"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-medium text-white",
                                                        getActivityZoneColor(user.activityZone?.zone)
                                                    )}>
                                                        {getActivityZoneLabel(user.activityZone?.zone)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className="flex items-center gap-1 text-amber-400" title="Stars">
                                                            <Star className="w-4 h-4" />
                                                            {getStats(user).stars.toLocaleString()}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-cyan-400" title="Diamonds">
                                                            <Diamond className="w-4 h-4" />
                                                            {getStats(user).diamonds.toLocaleString()}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-yellow-500" title="Coins">
                                                            <Coins className="w-4 h-4" />
                                                            {getStats(user).coins.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => openRoleModal(user)}>
                                                            <UserCog className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => openZoneModal(user)}>
                                                            <Ban className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="secondary" onClick={() => openStatsModal(user)}>
                                                            <Star className="w-4 h-4" />
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
                                        key={user._id || user.id || index}
                                        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                {(user.username || user.name || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-200 truncate">
                                                    {user.username || user.name || "Unknown"}
                                                </div>
                                                <div className="text-sm text-slate-400 truncate">
                                                    {user.email || "No email"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium text-white capitalize",
                                                getRoleColor(user.userRole || user.role)
                                            )}>
                                                {user.userRole || user.role || "user"}
                                            </span>
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium text-white",
                                                getActivityZoneColor(user.activityZone?.zone)
                                            )}>
                                                {getActivityZoneLabel(user.activityZone?.zone)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mb-3 text-sm">
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <Star className="w-4 h-4" />
                                                {getStats(user).stars.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1 text-cyan-400">
                                                <Diamond className="w-4 h-4" />
                                                {getStats(user).diamonds.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1 text-yellow-500">
                                                <Coins className="w-4 h-4" />
                                                {getStats(user).coins.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => openRoleModal(user)}>
                                                <UserCog className="w-4 h-4 mr-1" />
                                                Role
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => openZoneModal(user)}>
                                                <Ban className="w-4 h-4 mr-1" />
                                                Status
                                            </Button>
                                            <Button size="sm" variant="secondary" className="flex-1" onClick={() => openStatsModal(user)}>
                                                <Star className="w-4 h-4 mr-1" />
                                                Stats
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Role Change Modal */}
            {activeModal.type === "role" && activeModal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-100">Change Role</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-slate-400">
                                Change role for <span className="text-white font-medium">{activeModal.user.username || activeModal.user.name}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {USER_ROLES.map((role) => (
                                    <button
                                        key={role.value}
                                        onClick={() => setNewRole(role.value)}
                                        className={cn(
                                            "p-3 rounded-lg border-2 transition-all flex items-center",
                                            newRole === role.value
                                                ? "border-indigo-500 bg-indigo-500/10"
                                                : "border-slate-700 hover:border-slate-600"
                                        )}
                                    >
                                        <span className={cn("inline-block w-3 h-3 rounded-full mr-2", role.color)} />
                                        <span className="text-slate-200 text-sm">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button className="flex-1" onClick={handleRoleChange} disabled={modalLoading}>
                                    {modalLoading ? "Saving..." : "Save Role"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Zone Modal */}
            {activeModal.type === "zone" && activeModal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-100">Update Status</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-slate-400">
                                Update status for <span className="text-white font-medium">{activeModal.user.username || activeModal.user.name}</span>
                            </p>
                            <div className="space-y-2">
                                {ACTIVITY_ZONES.map((zone) => (
                                    <button
                                        key={zone.value}
                                        onClick={() => setNewZone(zone.value as typeof newZone)}
                                        className={cn(
                                            "w-full p-3 rounded-lg border-2 transition-all flex items-center",
                                            newZone === zone.value
                                                ? "border-indigo-500 bg-indigo-500/10"
                                                : "border-slate-700 hover:border-slate-600"
                                        )}
                                    >
                                        <span className={cn("inline-block w-3 h-3 rounded-full mr-3", zone.color)} />
                                        <span className="text-slate-200">{zone.label}</span>
                                        {newZone === zone.value && (
                                            <Check className="w-4 h-4 ml-auto text-indigo-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            {newZone === "temp_block" && (
                                <Input
                                    type="datetime-local"
                                    label="Block Until"
                                    value={zoneTillDate}
                                    onChange={(e) => setZoneTillDate(e.target.value)}
                                />
                            )}
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button className="flex-1" onClick={handleZoneChange} disabled={modalLoading}>
                                    {modalLoading ? "Saving..." : "Update Status"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Update Modal */}
            {activeModal.type === "stats" && activeModal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-100">Update Credits</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-slate-400">
                                Update credits for <span className="text-white font-medium">{activeModal.user.username || activeModal.user.name}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <Star className="w-4 h-4 inline mr-1 text-amber-400" />
                                        Stars
                                    </label>
                                    <input
                                        type="number"
                                        value={statsForm.stars}
                                        onChange={(e) => setStatsForm({ ...statsForm, stars: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <Diamond className="w-4 h-4 inline mr-1 text-cyan-400" />
                                        Diamonds
                                    </label>
                                    <input
                                        type="number"
                                        value={statsForm.diamonds}
                                        onChange={(e) => setStatsForm({ ...statsForm, diamonds: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-400">
                                <strong>Note:</strong> This will directly set the user's stars and diamonds to the specified values.
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button className="flex-1" onClick={handleStatsUpdate} disabled={modalLoading}>
                                    {modalLoading ? "Saving..." : "Update Credits"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
