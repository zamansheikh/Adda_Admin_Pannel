"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export default function Header() {
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
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6">
            <div className="flex-1">
                <h1 className="text-xl font-semibold text-slate-100">
                    Welcome back, {user?.username}!
                </h1>
                <p className="text-sm text-slate-400">Manage your AddaLive platform</p>
            </div>

            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors duration-200"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user?.username?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="text-left hidden md:block">
                            <div className="text-sm font-medium text-slate-200">{user?.username}</div>
                            <div className="text-xs text-slate-400 capitalize">{user?.role || "Admin"}</div>
                        </div>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200",
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
