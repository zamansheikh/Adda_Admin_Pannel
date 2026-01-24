"use client";

import { useState, useEffect } from "react";
import { rolesApi, User, USER_ROLES, ACTIVITY_ZONES } from "@/lib/api/roles";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    Users,
    Search,
    RefreshCw,
    Shield,
    UserCog,
    Ban,
    Star,
    Diamond,
    X,
    Check,
    ChevronDown,
    Coins,
} from "lucide-react";

// Helper to safely get stats
const getStats = (user: User) => {
    return {
        stars: user.stats?.stars || user.stars || 0,
        diamonds: user.stats?.diamonds || user.diamonds || 0,
        coins: user.stats?.coins || user.totalBoughtCoins || user.coins || 0
    };
};

export default function RolesPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("user");

    // Modal states
    const [actionModal, setActionModal] = useState<{
        type: "role" | "zone" | "stats" | null;
        user: User | null;
    }>({ type: null, user: null });
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [newRole, setNewRole] = useState("");
    const [newZone, setNewZone] = useState<"safe" | "temp_block" | "permanent_block">("safe");
    const [zoneTillDate, setZoneTillDate] = useState("");
    const [statsForm, setStatsForm] = useState({ stars: 0, diamonds: 0 });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await rolesApi.getUsersByRole(selectedRole);
            setUsers(response.users || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [selectedRole]);

    // Filter users based on search
    const filteredUsers = users.filter(
        (user) =>
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openRoleModal = (user: User) => {
        setNewRole(user.userRole || user.role || "user");
        setActionModal({ type: "role", user });
    };

    const openZoneModal = (user: User) => {
        const currentZone = user.activityZone?.zone || "safe";
        setNewZone(currentZone as typeof newZone);
        setZoneTillDate("");
        setActionModal({ type: "zone", user });
    };

    const openStatsModal = (user: User) => {
        const stats = getStats(user);
        setStatsForm({
            stars: stats.stars,
            diamonds: stats.diamonds,
        });
        setActionModal({ type: "stats", user });
    };

    const closeModal = () => {
        setActionModal({ type: null, user: null });
        setActionLoading(false);
    };

    const handleRoleChange = async () => {
        if (!actionModal.user) return;
        try {
            setActionLoading(true);
            await rolesApi.assignRole(newRole, { userId: actionModal.user._id });
            closeModal();
            fetchUsers();
        } catch (err) {
            console.error("Failed to assign role:", err);
            setError("Failed to assign role");
        } finally {
            setActionLoading(false);
        }
    };

    const handleZoneChange = async () => {
        if (!actionModal.user) return;
        try {
            setActionLoading(true);
            await rolesApi.updateActivityZone({
                id: actionModal.user._id,
                zone: newZone,
                ...(newZone === "temp_block" && zoneTillDate ? { dateTill: new Date(zoneTillDate).toISOString() } : {}),
            });
            closeModal();
            fetchUsers();
        } catch (err) {
            console.error("Failed to update activity zone:", err);
            setError("Failed to update activity zone");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatsUpdate = async () => {
        if (!actionModal.user) return;
        try {
            setActionLoading(true);
            await rolesApi.updateUserStats(actionModal.user._id, statsForm);
            closeModal();
            fetchUsers();
        } catch (err) {
            console.error("Failed to update stats:", err);
            setError("Failed to update user stats");
        } finally {
            setActionLoading(false);
        }
    };

    const getRoleColor = (role?: string) => {
        return USER_ROLES.find((r) => r.value === role)?.color || "bg-slate-500";
    };

    const getZoneColor = (activityZone?: { zone?: string }) => {
        return ACTIVITY_ZONES.find((z) => z.value === activityZone?.zone)?.color || "bg-green-500";
    };

    const getZoneLabel = (activityZone?: { zone?: string }) => {
        return ACTIVITY_ZONES.find((z) => z.value === activityZone?.zone)?.label || "Active";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                        Role Management
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage user roles, permissions, and access levels
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedRole("all")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedRole === "all"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                >
                    All
                </button>
                {USER_ROLES.map((role) => (
                    <button
                        key={role.value}
                        onClick={() => setSelectedRole(role.value)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedRole === role.value
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                    >
                        {role.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by username or email..."
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

            {/* Users List */}
            {!loading && (
                <>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>
                            {filteredUsers.length} {selectedRole}(s) found
                        </span>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-300 mb-2">
                                    No Users Found
                                </h3>
                                <p className="text-slate-500">
                                    {searchQuery
                                        ? "No users match your search"
                                        : `No users with ${selectedRole} role`}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredUsers.map((user) => (
                                <Card
                                    key={user._id}
                                    className="hover:border-indigo-500/50 transition-all duration-200"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            {/* User Info */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                                    {(user.username || user.name || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-100">
                                                        {user.username || user.name || "Unknown"}
                                                    </h3>
                                                    <p className="text-sm text-slate-400">
                                                        {user.email || "No email"}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getRoleColor(user.userRole || user.role)}`}>
                                                            {(user.userRole || user.role || "user").toUpperCase()}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getZoneColor(user.activityZone)}`}>
                                                            {getZoneLabel(user.activityZone)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-amber-400" title="Stars">
                                                    <Star className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{getStats(user).stars.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-cyan-400" title="Diamonds">
                                                    <Diamond className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{getStats(user).diamonds.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-yellow-500" title="Coins">
                                                    <Coins className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{getStats(user).coins.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openRoleModal(user)}
                                                >
                                                    <UserCog className="w-4 h-4 mr-1" />
                                                    Role
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openZoneModal(user)}
                                                >
                                                    <Ban className="w-4 h-4 mr-1" />
                                                    Status
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => openStatsModal(user)}
                                                >
                                                    <Star className="w-4 h-4 mr-1" />
                                                    Stats
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Role Change Modal */}
            {actionModal.type === "role" && actionModal.user && (
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
                                Changing role for <span className="text-white font-medium">{actionModal.user.username}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {USER_ROLES.map((role) => (
                                    <button
                                        key={role.value}
                                        onClick={() => setNewRole(role.value)}
                                        className={`p-3 rounded-lg border-2 transition-all ${newRole === role.value
                                            ? "border-indigo-500 bg-indigo-500/10"
                                            : "border-slate-700 hover:border-slate-600"
                                            }`}
                                    >
                                        <span className={`inline-block w-3 h-3 rounded-full ${role.color} mr-2`} />
                                        <span className="text-slate-200">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button className="flex-1" onClick={handleRoleChange} disabled={actionLoading}>
                                    {actionLoading ? "Saving..." : "Save Role"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Zone Modal */}
            {actionModal.type === "zone" && actionModal.user && (
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
                                Update status for <span className="text-white font-medium">{actionModal.user.username}</span>
                            </p>
                            <div className="space-y-2">
                                {ACTIVITY_ZONES.map((zone) => (
                                    <button
                                        key={zone.value}
                                        onClick={() => setNewZone(zone.value as typeof newZone)}
                                        className={`w-full p-3 rounded-lg border-2 transition-all flex items-center ${newZone === zone.value
                                            ? "border-indigo-500 bg-indigo-500/10"
                                            : "border-slate-700 hover:border-slate-600"
                                            }`}
                                    >
                                        <span className={`inline-block w-3 h-3 rounded-full ${zone.color} mr-3`} />
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
                                <Button className="flex-1" onClick={handleZoneChange} disabled={actionLoading}>
                                    {actionLoading ? "Saving..." : "Update Status"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Update Modal */}
            {actionModal.type === "stats" && actionModal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-100">Update Stats</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-slate-400">
                                Update credits for <span className="text-white font-medium">{actionModal.user.username}</span>
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
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button className="flex-1" onClick={handleStatsUpdate} disabled={actionLoading}>
                                    {actionLoading ? "Saving..." : "Update Stats"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
