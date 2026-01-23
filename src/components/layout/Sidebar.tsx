"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { navigationConfig, NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";
import Logo from "@/components/common/Logo";

export default function Sidebar() {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label]
        );
    };

    const renderNavItem = (item: NavigationItem, level = 0) => {
        const isExpanded = expandedItems.includes(item.label);
        const hasChildren = item.children && item.children.length > 0;
        const isActive = item.href === pathname;
        const Icon = item.icon;

        if (hasChildren) {
            return (
                <div key={item.label} className="mb-1">
                    <button
                        onClick={() => toggleExpand(item.label)}
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200",
                            "text-slate-300 hover:bg-slate-800 hover:text-white group"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {Icon && <Icon className="w-5 h-5" />}
                            <span className="font-medium">{item.label}</span>
                        </div>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                    {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                            {item.children?.map((child) => renderNavItem(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.label}
                href={item.href || "#"}
                className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group mb-1",
                    isActive
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
            >
                {Icon && (
                    <Icon
                        className={cn(
                            "w-5 h-5",
                            isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                        )}
                    />
                )}
                <span className="font-medium">{item.label}</span>
            </Link>
        );
    };

    return (
        <aside className="w-64 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <Logo size="md" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                    {navigationConfig.map((item) => renderNavItem(item))}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="text-xs text-slate-500 text-center">
                    © 2026 AddaLive
                </div>
            </div>
        </aside>
    );
}
