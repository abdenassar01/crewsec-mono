import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	output: "standalone",
	turbopack: {
		root: path.resolve(__dirname, "../.."),
	},
};

export default nextConfig;
