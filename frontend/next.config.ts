import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',
  distDir: 'build',
  images: {
    unoptimized: true, // 정적 export 시 이미지 최적화 기능은 꺼야 합니다.
  },
};

export default nextConfig;
