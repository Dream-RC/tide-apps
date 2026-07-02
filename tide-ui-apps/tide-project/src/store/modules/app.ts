import { CACHE_KEY, useCache } from "@/common/hooks/web/useCache";
import { create } from "zustand";

export type LayoutType = "defaults" | "classics";

const { wsCache } = useCache();

interface AppState {
    layout: LayoutType;
}
type AppActions = {};

const useAppStore = create<AppState & AppActions>(
    (set, get) => ({
        layout: wsCache.get(CACHE_KEY.LAYOUT) || "defaults", // layout布局
    }),
);

export default useAppStore;
