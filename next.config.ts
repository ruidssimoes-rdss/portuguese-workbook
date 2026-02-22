import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/lessons",
        permanent: true,
      },
      {
        source: "/dashboard/test/:section",
        destination: "/lessons/test/:section",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
