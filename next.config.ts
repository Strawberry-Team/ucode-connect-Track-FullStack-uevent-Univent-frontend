import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["localhost", "univent-platform.koyeb.app"],
    },
    devIndicators: false,
    // async rewrites() {
    //     return [
    //         {
    //             source: "/api/:path*",
    //             destination: "https://univent-platform.koyeb.app/api/:path*",
    //         },
    //         {
    //             source: "/uploads/:path*",
    //             destination: "https://univent-platform.koyeb.app/uploads/:path*",
    //         },
    //     ];
    // },
};

export default nextConfig;