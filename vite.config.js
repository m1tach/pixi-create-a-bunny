import { defineConfig } from "vite";
import XMLLoader from "vite-plugin-xml-loader";

export default defineConfig({
  server: {
    port: 8080,
  },
  publicDir: "src/assets",
  plugins: [XMLLoader()],
});
