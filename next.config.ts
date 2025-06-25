import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["localhost", "univent-platform.koyeb.app"],
    },
    devIndicators: false,
};

export default nextConfig;