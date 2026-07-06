import type { NextConfig } from "next";
import { securityHeaders } from "@/lib/security-headers";

const leaked = Object.keys(process.env).filter(
  (k) => k.startsWith("NEXT_PUBLIC_") && /(TOKEN|SECRET|KEY|PASSWORD)/i.test(k),
);
if (leaked.length > 0) {
  throw new Error(
    `[security] CMS tokens with NEXT_PUBLIC_ prefix would leak to client bundle: ${leaked.join(", ")}`,
  );
}

const cmsImageDomains: { protocol: "https"; hostname: string }[] = (
  process.env.CMS_IMAGE_DOMAINS ?? ""
)
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean)
  .map((hostname) => ({ protocol: "https" as const, hostname }));

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  cacheLife: {
    editorial: {
      stale: 300,
      revalidate: 3600,
      expire: 86400,
    },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      ...cmsImageDomains,
    ],
    qualities: [50, 75, 100],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...securityHeaders(),
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
