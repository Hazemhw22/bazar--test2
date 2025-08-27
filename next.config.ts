import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ["ar", "en", "he"],
    defaultLocale: "ar",
    localeDetection: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
