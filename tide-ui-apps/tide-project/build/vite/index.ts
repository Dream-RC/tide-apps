import type { PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import qiankun from "vite-plugin-qiankun";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";

export const createVitePlugins = () => {
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    react(),
    qiankun("tide-ui-project", {
      useDevMode: true,
    }),
    tailwindcss(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.md$/, // .md
      ],
      imports: ["react","react-router"],
      dts: "src/types/auto-imports.d.ts",
    }),
  ];

  return vitePlugins;
};
