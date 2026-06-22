import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppView from "./component/AppView.vue";
import Menu from "./component/menu/Menu.vue";
import NavTop from "./component/nav/NavTop.vue";
import Dock from "./component/dock/dock.vue";

export const iframeHeight = "800px";
export const description =
    "A dashboard with sidebar, data table, and analytics cards.";

export const useRenderLayout = () => {
    //经典默认布局
    const renderDefaults = () => {
        return (
            <>
                {/* 左侧菜单 */}
                <SidebarProvider>
                    <Menu />
                    <SidebarInset>
                        <Dock />
                        {/* 顶部导航栏 */}
                        {/* <NavTop /> */}
                        <div class="flex min-h-screen s flex-col p-6">
                            <AppView />
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </>
        );
    };

    //经典布局
    const renderClassics = () => {
        return (
            <>
                <SidebarProvider>
                    <Menu />

                    <SidebarInset>
                        <NavTop />
                        <div className="pt-14 px-8">
                            <AppView />
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </>
        );
    };

    return {
        renderDefaults,
        renderClassics,
    };
};

//                 style=" {
//   '--sidebar-width': 'calc(var(--spacing) * 72)',
//   '--header-height': 'calc(var(--spacing) * 12)',
// }"
//                 className="'--sidebar-width': 'calc(var(--spacing) * 72)'"
