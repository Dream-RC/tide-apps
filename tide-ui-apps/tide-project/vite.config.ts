import type { ConfigEnv, UserConfig } from "vite";
import { createVitePlugins } from "./build/vite";
import { loadEnv } from "vite";
import path from "node:path";

// 当前执行node命令时文件夹的地址(工作目录)
const root = process.cwd();

export default ({ command, mode }: ConfigEnv): UserConfig => {
  let env = {} as any;
  const isBuild = command === "build";
  if (!isBuild) {
    env = loadEnv(
      process.argv[3] === "--mode" ? process.argv[4] : process.argv[3],
      root,
    );
  } else {
    env = loadEnv(mode, root);
  }

  return {
    server: {
      // 是否开启 https
      // https: false,
      // 端口号
      port: env.VITE_PORT,
      host: "0.0.0.0",
      origin: `http://localhost:${env.VITE_PORT}`,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      // 本地跨域代理. 目前注释的原因：暂时没有用途，server 端已经支持跨域
    },
    plugins: createVitePlugins(),
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/variables.scss" as *;',
          // javascriptEnabled: true,
        },
      },
    },
    resolve: {
      extensions: [
        ".mjs",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".json",
        ".scss",
        ".css",
      ],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
};