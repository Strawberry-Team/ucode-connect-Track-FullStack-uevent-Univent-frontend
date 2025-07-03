import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["localhost", "univent-platform.onrender.com"],
    },
    devIndicators: false,
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "https://univent-platform.onrender.com/api/:path*",
            },
            {
                source: "/uploads/:path*",
                destination: "https://univent-platform.onrender.com/uploads/:path*",
            },
        ];
    },
};

export default nextConfig;