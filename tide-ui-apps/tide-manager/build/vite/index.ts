import type { PluginOption } from "vite";
import Vue from "@vitejs/plugin-vue";
import VueJsx from "@vitejs/plugin-vue-jsx";
import AutoImport from "unplugin-auto-import/vite";
import tailwindcss from "@tailwindcss/vite";
import qiankun from "vite-plugin-qiankun";
export const createVitePlugins = () => {
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    Vue(),
    VueJsx(),
    tailwindcss(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      imports: ["vue", "vue-router"],
      dts: "src/types/auto-imports.d.ts",
    }),
    qiankun("tide-ui-manager", {
      useDevMode: true,
    }),
  ];

  return vitePlugins;
};
