import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cscb.compiledideas.dev",
			},
		],
	},
	turbopack: {
		root: path.resolve(__dirname, "../.."),
	},
};

export default nextConfig;
