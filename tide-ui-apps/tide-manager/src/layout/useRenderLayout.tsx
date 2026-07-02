import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { computed, unref } from "vue";
import Menu from "./component/menu/Menu.vue";
import NavTop from "./component/nav/NavTop.vue";
import Dock from "./component/dock/dock.vue";
import GalleryScroll from "./component/GalleryScroll.vue";
import { useAppStore } from "@/store/modules/app";
import { usePermissionStore } from "@/store/modules/permission";


export const useRenderLayout = () => {

    const appStore = useAppStore()
    const permissionStore = usePermissionStore()

    const layout = computed(() => appStore.getLayout)

    const routers = computed(() =>
        unref(layout) === 'defaults' ? permissionStore.getMenuTabRouters : permissionStore.getRouters
    )

    const hasMenu = computed(() => routers.value && routers.value.length > 0)

    //经典默认布局
    const renderDefaults = () => {
        return (
            <>
                <SidebarProvider>
                    <Menu />
                    <GalleryScroll hasMenu={hasMenu.value} />
                </SidebarProvider>

                <Dock />
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
                        <div class="pt-14 px-8">
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