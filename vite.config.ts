import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { mockApiPlugin } from "./src/shared/mock/mockApiPlugin";

// Get repository name from environment or use default
// For GitHub Pages, base should be "/repository-name/" or "/" for user/organization pages
const getBasePath = () => {
	if (process.env.GITHUB_PAGES) {
		// If GITHUB_REPOSITORY is available, use it to construct base path
		const repo = process.env.GITHUB_REPOSITORY;
		if (repo) {
			const repoName = repo.split("/")[1];
			return `/${repoName}/`;
		}
		// Fallback: try to get from package.json or use default
		return "/vite-project/";
	}
	return "/";
};

// https://vite.dev/config/
export default defineConfig({
	base: getBasePath(),
	plugins: [
		react(),
		// Mock API plugin only works in dev mode (configureServer is only called in dev)
		mockApiPlugin(),
	],
});
