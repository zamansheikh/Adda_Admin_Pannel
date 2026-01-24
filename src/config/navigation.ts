import { LucideIcon, LayoutDashboard, Users, FileText, Gift, DollarSign, Shield, Settings } from "lucide-react";

export interface NavigationItem {
    label: string;
    href?: string;
    icon?: LucideIcon;
    children?: NavigationItem[];
}

export const navigationConfig: NavigationItem[] = [
    {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Users",
        icon: Users,
        children: [
            { label: "All Users", href: "/users" },
            { label: "By Role", href: "/users/roles" },
            { label: "Activity Zones", href: "/users/activity" },
        ],
    },
    {
        label: "Content",
        icon: FileText,
        children: [
            { label: "Posts", href: "/content/posts" },
            { label: "Reels", href: "/content/reels" },
            { label: "Stories", href: "/content/stories" },
        ],
    },
    {
        label: "Monetization",
        icon: Gift,
        children: [
            { label: "Gifts", href: "/gifts" },
            { label: "Gift Categories", href: "/gift-categories" },
            { label: "Banners", href: "/banners" },
            { label: "Posters", href: "/posters" },
        ],
    },
    {
        label: "Financial",
        icon: DollarSign,
        children: [
            { label: "Salaries", href: "/financial/salaries" },
            { label: "Withdraw Requests", href: "/financial/withdrawals" },
            { label: "Agency Withdrawals", href: "/financial/agency-withdrawals" },
            { label: "Transaction History", href: "/financial/transactions" },
        ],
    },
    {
        label: "Access Control",
        icon: Shield,
        children: [
            { label: "Roles", href: "/access/roles" },
            { label: "Permissions", href: "/access/permissions" },
            { label: "Portal Users", href: "/access/portal-users" },
        ],
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
    },
];
