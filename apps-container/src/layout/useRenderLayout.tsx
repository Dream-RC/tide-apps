import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import usePermissionStore from "@/store/modules/permission";
import useAppsStore from "@/store/modules/appsStore";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import Header from "./component/Header";

function renderMenuItems(
    routes: AppRouteRecordRaw[],
    navigate: (path: string) => void,
    currentPath: string,
) {
    return routes
        .filter((r) => r.meta && !r.path.includes("*"))
        .map((route) => {
            const fullPath = route.path.startsWith("/")
                ? route.path
                : `/${route.path}`;
            const isActive = currentPath === fullPath ||
                currentPath.startsWith(fullPath + "/");

            return (
                <SidebarMenuItem key={route.path}>
                    <SidebarMenuButton asChild isActive={isActive}>
                        <a
                            href={fullPath}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(fullPath);
                            }}
                        >
                            {route.meta?.title || route.name || route.path}
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        });
}

export const useRenderLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const routers = usePermissionStore((state) => state.routers);
    const apps = useAppsStore((state) => state.apps);
    const fetchApps = useAppsStore((state) => state.fetchApps);

    useEffect(() => {
        fetchApps();
    }, [fetchApps]);

    const renderMain = () => {
        const isSubAppActive = apps.some((app) =>
            location.pathname.startsWith(`/${app.appCode}`)
        );

        return (
            <SidebarInset>
                <Header />
                <div className="flex flex-1 flex-col overflow-auto">
                    <div
                        id="subapp-container"
                        className={isSubAppActive ? "flex-1" : ""}
                    />
                    {!isSubAppActive && (
                        <div className="flex-1">
                            <Outlet />
                        </div>
                    )}
                </div>
            </SidebarInset>
        );
    };

    const renderDefaults = () => {
        return (
            <SidebarProvider className="h-svh overflow-hidden">
                {renderMain()}
            </SidebarProvider>
        );
    };

    const renderClassics = () => {
        return (
            <SidebarProvider className="h-svh overflow-hidden">
            </SidebarProvider>
        );
    };

    return {
        renderDefaults,
        renderClassics,
    };
};