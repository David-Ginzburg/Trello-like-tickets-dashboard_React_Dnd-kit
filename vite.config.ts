import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { mockApiPlugin } from "./src/shared/mock/mockApiPlugin";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), mockApiPlugin()],
});
