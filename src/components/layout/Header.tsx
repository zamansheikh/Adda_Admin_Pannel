"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, ChevronDown, Menu, Coins, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { adminApi } from "@/lib/api/admin";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Portal from "@/components/ui/Portal";

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Coin Generation State
    const [coins, setCoins] = useState<number | null>(null);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [generateAmount, setGenerateAmount] = useState<number | string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Dropdown Positioning
    const [dropdownCoords, setDropdownCoords] = useState({ top: 0, right: 0 });

    const fetchCoins = async () => {
        try {
            const profile = await adminApi.getProfile();
            setCoins(profile.coins || 0);
        } catch (err) {
            console.error("Failed to fetch admin coins:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCoins();
        }
    }, [user]);

    const handleGenerateCoins = async () => {
        const amount = Number(generateAmount);
        if (!amount || amount <= 0) return;

        try {
            setIsGenerating(true);
            await adminApi.assignCoins(amount);
            await fetchCoins();
            setIsGenerateModalOpen(false);
            setGenerateAmount("");
        } catch (err) {
            console.error("Failed to generate coins:", err);
            // Optionally show error to user (add toast later)
        } finally {
            setIsGenerating(false);
        }
    };

    const formatBalance = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            notation: "compact",
            maximumFractionDigits: 2
        }).format(num);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is inside dropdown (we need a ref for the portal content if possible, or just rely on button ref logic)
            // Since Portal content is outside root, standard ref checking might be tricky if we don't ref the portal content.
            // But we can check if target is NOT the button.
            // Actually, simplest is to use a transparent backdrop for the dropdown like we do for modal?
            // No, standard dropdown behavior is click outside closes.
            // Let's use a wrapper ref for the portal content.
        };

        const handleScroll = () => {
            if (isDropdownOpen) setIsDropdownOpen(false);
        };

        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleScroll);
        };
    }, [isDropdownOpen]);

    const toggleDropdown = () => {
        if (!isDropdownOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setDropdownCoords({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
            setIsDropdownOpen(true);
        } else {
            setIsDropdownOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4 flex-1">
                {/* Hamburger Menu (Mobile Only) */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6 text-slate-300" />
                </button>

                <div className="flex-1">
                    <h1 className="text-lg md:text-xl font-semibold text-slate-100">
                        Welcome back, {user?.username}!
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 hidden sm:block">Manage your AddaLive platform</p>
                </div>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Admin Coin Balance */}
                {coins !== null && (
                    <div className="flex items-center gap-1 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full pl-2 pr-1 py-1 transition-all max-w-[120px] sm:max-w-none">
                        <div className="flex items-center gap-1 min-w-0">
                            <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">{formatBalance(coins)}</span>
                        </div>
                        <button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-0.5 sm:p-1 rounded-full transition-colors flex-shrink-0"
                            title="Generate Coins"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                )}
                <button
                    ref={dropdownRef as any}
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors duration-200"
                >
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm md:text-base">
                            {user?.username?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="text-left hidden lg:block">
                            <div className="text-sm font-medium text-slate-200">{user?.username}</div>
                            <div className="text-xs text-slate-400 capitalize">{user?.role || "Admin"}</div>
                        </div>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200 hidden md:block",
                            isDropdownOpen && "rotate-180"
                        )}
                    />
                </button>

                {/* Dropdown menu - Portaled */}
                {isDropdownOpen && (
                    <Portal>
                        <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsDropdownOpen(false)}
                        />
                        <div
                            className="fixed z-50 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                            style={{
                                top: dropdownCoords.top,
                                right: dropdownCoords.right
                            }}
                        >
                            <div className="p-3 border-b border-slate-700">
                                <div className="text-sm font-medium text-slate-200">{user?.username}</div>
                                <div className="text-xs text-slate-400">{user?.email}</div>
                            </div>
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        router.push("/profile");
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors duration-200"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors duration-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </Portal>
                )}
            </div>

            {/* Generate Coins Modal */}
            {/* Generate Coins Modal */}
            {isGenerateModalOpen && (
                <Portal>
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGenerateModalOpen(false)} />
                        <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                                    <Coins className="w-5 h-5 text-yellow-500" />
                                    Generate Coins
                                </h2>
                                <button onClick={() => setIsGenerateModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Amount to Generate</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount (e.g. 1000)"
                                        value={generateAmount}
                                        onChange={(e) => setGenerateAmount(e.target.value)}
                                        className="bg-slate-950/50 border-slate-700 focus:border-indigo-500"
                                        min="1"
                                    />
                                    <p className="text-xs text-slate-500">
                                        These coins will be added to your admin balance.
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setIsGenerateModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button className="flex-1" onClick={handleGenerateCoins} disabled={isGenerating || !generateAmount || Number(generateAmount) <= 0}>
                                        {isGenerating ? "Generating..." : "Generate"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </header>
    );
}
