import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { mockApiPlugin } from "./src/shared/mock/mockApiPlugin";

// https://vite.dev/config/
export default defineConfig({
	base: "/",
	build: {
		outDir: "dist",
		assetsDir: "assets",
	},
	plugins: [
		react(),
		// Mock API plugin only works in dev mode (configureServer is only called in dev)
		mockApiPlugin(),
	],
});
