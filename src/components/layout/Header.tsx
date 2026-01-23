"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, ChevronDown, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

                {/* Dropdown menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
                        <div className="p-3 border-b border-slate-700">
                            <div className="text-sm font-medium text-slate-200">{user?.username}</div>
                            <div className="text-xs text-slate-400">{user?.email}</div>
                        </div>
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    // Navigate to profile
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
                )}
            </div>
        </header>
    );
}
