import type { PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import qiankun from "vite-plugin-qiankun";

export const createVitePlugins = () => {
    const vitePlugins: (PluginOption | PluginOption[])[] = [
        react(),
        qiankun("tide-ui-project", {
            useDevMode: true,
        }),
    ];

    return vitePlugins;
};
