import { create } from "zustand";
import { AppApi } from "@/common/api/upms/app";

export interface SubApp {
  appId: number;
  appCode: string;
  url: string;
  appName?: string;
}

interface AppsState {
  apps: SubApp[];
  isLoaded: boolean;
  fetchApps: () => Promise<SubApp[]>;
}

const useAppsStore = create<AppsState>((set, get) => ({
  apps: [],
  isLoaded: false,
  fetchApps: async () => {
    if (get().isLoaded) return get().apps;
    try {
      const res: any = await AppApi.getSimpleAppList();
      if (res && Array.isArray(res)) {
        set({ apps: res, isLoaded: true });
        return res;
      }
      set({ isLoaded: true });
      return [];
    } catch (err) {
      console.warn("[appsStore] 获取子应用列表失败:", err);
      set({ isLoaded: true });
      return [];
    }
  },
}));

export default useAppsStore;
