import type { ConfigEnv, UserConfig } from "vite";
import { createVitePlugins } from "./build/vite";
import { loadEnv } from "vite";

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
      port: env.VITE_PORT,
    },
    plugins: createVitePlugins(),
  };
};
