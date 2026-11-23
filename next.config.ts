import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "ais-dev-kfzbkrwoncpjia3yub2plt-402327827919.us-west2.run.app",
    "ais-pre-kfzbkrwoncpjia3yub2plt-402327827919.us-west2.run.app",
    "*.us-west2.run.app",
    "*.run.app",
    "**.run.app",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
