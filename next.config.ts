import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev server access from these origins
  allowedDevOrigins: [
    "http://88.222.213.235:3004",
    "http://88.222.213.235:8000",
    "http://192.168.68.51:3004",
    "https://admin.zigoliveapp.xyz",
    "https://api.zigoliveapp.xyz",
    "http://admin.zigoliveapp.xyz",
  ],
};

export default nextConfig;
