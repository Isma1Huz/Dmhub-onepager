import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/", destination: "/nl/onepage", permanent: false },
      { source: "/onepage", destination: "/nl/onepage", permanent: false },
    ];
  },
};

export default config;
