"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, FileText, Gift, DollarSign, TrendingUp, Activity } from "lucide-react";

export default function DashboardPage() {
    const stats = [
        {
            label: "Total Users",
            value: "12,345",
            change: "+12.5%",
            icon: Users,
            color: "from-blue-500 to-cyan-500",
        },
        {
            label: "Active Posts",
            value: "8,432",
            change: "+8.2%",
            icon: FileText,
            color: "from-purple-500 to-pink-500",
        },
        {
            label: "Total Gifts",
            value: "156",
            change: "+4",
            icon: Gift,
            color: "from-orange-500 to-red-500",
        },
        {
            label: "Revenue",
            value: "$45,231",
            change: "+18.7%",
            icon: DollarSign,
            color: "from-green-500 to-emerald-500",
        },
    ];

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">Dashboard</h1>
                <p className="text-sm md:text-base text-slate-400">
                    Overview of your AddaLive platform performance
                </p>
            </div>

            {/* Stats Grid - Responsive: 1 col mobile, 2 tablet, 4 desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} variant="glass" className="hover:scale-105 transition-transform duration-200">
                            <CardContent className="p-4 md:p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-slate-400 text-xs md:text-sm font-medium">
                                            {stat.label}
                                        </p>
                                        <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mt-2">
                                            {stat.value}
                                        </h3>
                                        <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            {stat.change}
                                        </p>
                                    </div>
                                    <div
                                        className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}
                                    >
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { action: "New user registered", time: "2 minutes ago", type: "user" },
                                { action: "Post reported", time: "15 minutes ago", type: "content" },
                                { action: "Gift created", time: "1 hour ago", type: "gift" },
                                { action: "Withdrawal approved", time: "2 hours ago", type: "financial" },
                            ].map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors duration-200"
                                >
                                    <div>
                                        <p className="text-slate-200 text-sm font-medium">
                                            {activity.action}
                                        </p>
                                        <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: "Active Users Today", value: "2,845", percentage: 78 },
                                { label: "Pending Approvals", value: "12", percentage: 45 },
                                { label: "New Registrations", value: "156", percentage: 92 },
                                { label: "System Health", value: "98%", percentage: 98 },
                            ].map((item, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-300 text-sm">{item.label}</span>
                                        <span className="text-slate-100 font-semibold">{item.value}</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
