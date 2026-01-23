"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
}

export default function Logo({ className, size = "md", showText = true }: LogoProps) {
    const sizes = {
        sm: "h-8",
        md: "h-10",
        lg: "h-12",
    };

    const textSizes = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
    };

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className={cn("relative", sizes[size])}>
                {/* Gradient circle logo */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg animate-pulse" />
                <div className="relative h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg">
                    <span className="text-white font-bold text-xl px-3">A</span>
                </div>
            </div>
            {showText && (
                <span className={cn("font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent", textSizes[size])}>
                    AddaLive
                </span>
            )}
        </div>
    );
}
