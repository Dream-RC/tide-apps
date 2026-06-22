import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { hasOneShowingChild } from "./menuUtils";
import { pathResolve } from "@/common/utils/routerHelper";
import { isUrl } from "@/common/utils/is";
import { ChevronRight } from "lucide-vue-next";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

// import { useRenderMenuTitle } from "./menuUtils";

// import { useState } from "react";
// import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { useRenderMenuTitle } from "./useRenderMenuTitle";

export const useRenderMenuItem = (menuSelect?: (key: string) => void) => {
    const { renderMenuTitle } = useRenderMenuTitle();
    // const [activeTeam] = useState(true);

    const router = useRouter();
    const { currentRoute } = router;

    // 如果需要默认展开某些菜单，可以在这里设置
    const expandedKeys = ref(new Set<string>());

    // 监听当前路由，自动展开对应的父级菜单
    watch(currentRoute, (route) => {
        const currentPath = route.path;
        // 如果当前路由包含在某个菜单路径中，自动展开该菜单
        const paths = currentPath.split("/").filter(Boolean);
        let currentParentPath = "";

        for (const segment of paths) {
            currentParentPath += "/" + segment;
            expandedKeys.value.add(currentParentPath);
        }
    }, { immediate: true });

    const toggleExpand = (key: string) => {
        const newSet = new Set(expandedKeys.value);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        expandedKeys.value = newSet;
    };

    // 处理菜单项点击
    const handleMenuItemClick = (key: string) => {
        if (menuSelect) {
            menuSelect(key);
        }
    };

    const renderMenuItem = (
        routers: AppRouteRecordRaw[],
        parentPath = "/",
    ) => {
        return routers
            .filter((v) => !v.meta?.hidden)
            .map((v) => {
                const meta = v.meta ?? {};
                const { oneShowingChild, onlyOneChild } = hasOneShowingChild(
                    v.children,
                    v,
                );
                const fullPath = isUrl(v.path)
                    ? v.path
                    : pathResolve(parentPath, v.path);

                // 判断当前菜单是否激活
                const isActive = currentRoute.value.path === fullPath ||
                    (v.children && v.children.some((child) => {
                        const childPath = pathResolve(fullPath, child.path);
                        return currentRoute.value.path === childPath;
                    }));

                // ===== 单子路由 =====
                if (
                    oneShowingChild &&
                    (!onlyOneChild?.children ||
                        onlyOneChild?.noShowingChildren) &&
                    !meta?.alwaysShow
                ) {
                    const childPath = pathResolve(fullPath, onlyOneChild.path);
                    const isChildActive = currentRoute.value.path === childPath;

                    return (
                        <SidebarMenuItem key={childPath}>
                            <SidebarMenuButton
                                class={cn(
                                    "flex items-center gap-3 h-10 p-3 w-full",
                                    isChildActive &&
                                        "rounded-lg  bg-accent ",
                                )}
                                onClick={() => handleMenuItemClick(childPath)}
                            >
                                <RouterLink
                                    to={childPath}
                                    class="w-full flex items-center"
                                >
                                    {renderMenuTitle(onlyOneChild?.meta)}
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                }

                // 多子菜单，点击展开
                const isOpen = expandedKeys.value.has(fullPath);

                // ===== 多级菜单 =====
                return (
                    <Collapsible
                        key={fullPath}
                        open={isOpen}
                        class="group/collapsible"
                        as-child
                    >
                        <CollapsibleTrigger asChild>
                            {/* tooltip={meta.title} */}
                            <SidebarMenuButton
                                // className="gap-3 h-10"
                                onClick={() => toggleExpand(fullPath)}
                                className={cn(
                                    "h-10 p-3 flex items-center gap-3 w-full",
                                    isActive && " ",
                                )}
                            >
                                {renderMenuTitle(v?.meta)}
                                <ChevronRight
                                    size={16}
                                    class={cn(
                                        "ml-auto transition-transform duration-200",
                                        isOpen && "rotate-90",
                                    )}
                                />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {renderMenuItem(v.children!, fullPath)}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                );
            });
    };

    return { renderMenuItem };
};
