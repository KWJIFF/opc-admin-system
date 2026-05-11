import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Mermaid 及其依赖单独分包（最大的依赖）
          if (id.includes("node_modules/mermaid") || 
              id.includes("node_modules/dagre") ||
              id.includes("node_modules/cytoscape") ||
              id.includes("node_modules/elkjs") ||
              id.includes("node_modules/d3")) {
            return "mermaid-vendor";
          }
          // React 核心库
          if (id.includes("node_modules/react/") || 
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/")) {
            return "react-vendor";
          }
          // UI 组件库（radix、lucide等）
          if (id.includes("node_modules/@radix-ui") || 
              id.includes("node_modules/lucide-react")) {
            return "ui-vendor";
          }
          // 其他大型第三方库
          if (id.includes("node_modules/recharts") ||
              id.includes("node_modules/framer-motion")) {
            return "charts-vendor";
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
