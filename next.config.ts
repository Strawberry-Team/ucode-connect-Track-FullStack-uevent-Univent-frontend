import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "",
                pathname: "/**",
            },
        ]
    },
};

export default nextConfig;
