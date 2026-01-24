"use client";

import React, { useState, useEffect } from "react";
import { adminApi, AdminProfile } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { User, Mail, Shield, Coins, Lock, Loader2 } from "lucide-react";

export default function ProfilePage() {
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getProfile();
            setProfile(data);
            setFormData({
                username: data.username,
                email: data.email,
                password: ""
            });
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");
            const updateData: any = {
                username: formData.username,
                email: formData.email
            };
            if (formData.password) {
                updateData.password = formData.password;
            }

            const updated = await adminApi.updateProfile(updateData);
            setProfile(updated);
            setIsEditing(false);
            setFormData(prev => ({ ...prev, password: "" })); // Clear password
        } catch (err: any) {
            console.error("Failed to update profile:", err);
            setError(err.response?.data?.message || err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
                <p className="text-slate-400">Manage your account settings and preferences</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-400" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-medium border border-indigo-500/20">
                                    <Shield className="w-3 h-3" />
                                    {profile.role}
                                </span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Username</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Username"
                                            className="bg-slate-950/50"
                                        />
                                    ) : (
                                        <div className="p-3 bg-slate-800/50 rounded-lg text-slate-200 border border-slate-700">
                                            {profile.username}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Email Address</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Email"
                                            className="bg-slate-950/50"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg text-slate-200 border border-slate-700">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            {profile.email}
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-400">New Password (Optional)</label>
                                        <Input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Leave blank to keep current password"
                                            className="bg-slate-950/50"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-400">Coin Balance</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <Coins className="w-5 h-5 text-yellow-500" />
                                        <span className="text-xl font-bold text-slate-100">
                                            {profile.coins?.toLocaleString() || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-800">
                                {isEditing ? (
                                    <>
                                        <Button variant="outline" onClick={() => { setIsEditing(false); setError(""); }}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave} disabled={saving}>
                                            {saving ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
