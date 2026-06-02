import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/chat": ["./data/knowledge-base.txt"],
  },
}

export default nextConfig
