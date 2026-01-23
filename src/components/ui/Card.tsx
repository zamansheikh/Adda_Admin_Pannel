"use client";

import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
    const variants = {
        default: "bg-slate-800/50 border border-slate-700",
        glass: "bg-slate-800/30 backdrop-blur-xl border border-slate-700/50",
    };

    return (
        <div
            className={cn(
                "rounded-xl shadow-xl transition-all duration-200",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("p-6 pb-4", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn("text-xl font-semibold text-slate-100", className)} {...props}>
            {children}
        </h3>
    );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("p-6 pt-0", className)} {...props}>
            {children}
        </div>
    );
}
