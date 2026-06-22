<script lang="tsx">
import {
    SidebarProvider, Sidebar, SidebarHeader,
    SidebarMenu, SidebarMenuItem, SidebarMenuButton,
    SidebarContent,
    SidebarFooter
} from '@/components/ui/sidebar';
import { useAppStore } from '@/store/modules/app';
import { usePermissionStore } from '@/store/modules/permission';
import { useRenderMenuItem } from './src/useRenderMenuItem';
import NavUser from '../nav/NavUser.vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/chronos-ui/Icon';
import { CACHE_KEY, useCache } from '@/common/hooks/web/useCache';

export default defineComponent({
    name: 'Menu',
    props: {
        showMenu: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {


        const appStore = useAppStore()

        const permissionStore = usePermissionStore()

        const layout = computed(() => appStore.getLayout)

        const { wsCache } = useCache()
        const isDarkTheme = ref(appStore.isDark)

        // 主题切换函数 - 使用appStore的setIsDark方法
        const toggleTheme = () => {
            appStore.setIsDark(!isDarkTheme.value)
            isDarkTheme.value = appStore.isDark
        }


        const routers = computed(() =>
            unref(layout) === 'defaults' ? permissionStore.getMenuTabRouters : permissionStore.getRouters
        )

        const { renderMenuItem } = useRenderMenuItem()

        const router = useRouter()
        const { currentRoute } = router

        // 激活的菜单 - 从当前路由获取
        // const activeMenu = ref(currentRoute.value.path)

        // 监听路由变化，更新激活菜单
        // watch(currentRoute, (route) => {
        //     activeMenu.value = route.path
        // })

        // 菜单选择事件
        // const menuSelect = (key: string) => {
        //     activeMenu.value = key
        // }

        // 控制菜单显示/隐藏
        const isMenuVisible = computed(() => {
            // 如果没有路由数据，不显示菜单
            return routers.value && routers.value.length > 0;
        })


        const renderMenu = () => {
            // 如果菜单不可见，返回 null
            if (!isMenuVisible.value) {
                return null;
            }

            return (
                <>
                    {/* variant="floating" */}
                    {/* className="menu-sidebar overflow-hidden" */}
                    {/* menu-sidebar overflow-hidden */}
                    <Sidebar class="menu-sidebar">
                        <SidebarHeader>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    {/* <SidebarMenuButton
                                        as-child
                                        class="data-[slot=sidebar-menu-button]:!p-1.5"
                                    > */}
                                    <div class="flex items-center justify-between">
                                        <a class="flex items-center gap-4">
                                            <Avatar class="h-8 w-8 rounded-lg grayscale">
                                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                                <AvatarFallback class="rounded-lg">
                                                    CN
                                                </AvatarFallback>
                                            </Avatar>
                                            <span class="text-base font-semibold">Chronos.</span>
                                        </a>

                                        <Button variant="outline"
                                            onClick={toggleTheme}>
                                            {isDarkTheme.value ? <Icon icon="sun" class="" /> : <Icon icon="ic_moon" />}
                                        </Button>
                                    </div>
                                    {/* </SidebarMenuButton> */}

                                </SidebarMenuItem>
                            </SidebarMenu >
                        </SidebarHeader >

                        <SidebarContent class="scrollbar-hide">
                            <SidebarMenu class="flex flex-col gap-2 px-2 ">
                                {
                                    renderMenuItem(routers.value, '/')
                                }
                            </SidebarMenu>
                        </SidebarContent>

                        <SidebarFooter>
                            <NavUser />
                        </SidebarFooter>

                    </Sidebar >

                </>
            )
        }


        return () => (
            <>
                {renderMenu()}
            </>
        )

    }

})

</script>