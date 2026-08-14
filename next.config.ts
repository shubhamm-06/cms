import type { NextConfig } from "next";

/**
 * Public property catalogue covers are served from the public `property-images`
 * Supabase Storage bucket. Scope the allowance to that project host and that
 * bucket path only, never a wildcard.
 */
function supabaseImagePatterns() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return [];

  try {
    const { hostname, protocol } = new URL(supabaseUrl);
    if (protocol !== "https:") return [];

    return [
      {
        protocol: "https" as const,
        hostname,
        pathname: "/storage/v1/object/public/property-images/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    /**
     * Next.js 16 allowlists optimizer qualities and defaults to `[75]` alone.
     * 85 is allowed as well so the large photographic `/booking` hero keeps
     * smooth water and sky gradients free of visible compression blocking;
     * every other image stays on the 75 default.
     */
    qualities: [75, 85],
    remotePatterns: supabaseImagePatterns(),
  },
};

export default nextConfig;
