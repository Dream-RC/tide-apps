import type { PluginOption } from "vite";
import React from "@vitejs/plugin-react";

export const createVitePlugins = () => {
    const vitePlugins: (PluginOption | PluginOption[])[] = [
        React(),
    ];

    return vitePlugins;
};
