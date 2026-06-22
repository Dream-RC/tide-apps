<script lang="tsx">
import { useAppStore } from '@/store/modules/app';
import { usePermissionStore } from '@/store/modules/permission';
import { pathResolve } from "@/common/utils/routerHelper";
import { cloneDeep } from "lodash-es";

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuTrigger,
    DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/chronos-ui/Icon/src/Icon.vue';
import { isUrl } from '@/common/utils/is';
import { initTabMap, filterMenusPath } from './src/helper';

export default defineComponent({
    name: 'TapMenu',
    props: {},
    setup(props) {

        const appStore = useAppStore()

        const layout = computed(() => appStore.getLayout)

        const permissionStore = usePermissionStore()

        const routers = computed(() => permissionStore.getRouters)

        const tabRouters = computed(() => unref(routers).filter((v) => !v?.meta?.hidden))

        const { push, currentRoute } = useRouter()


        const tabActive = ref('')
        // const showMenu = ref(false)

        const tabClick = (item: AppRouteRecordRaw) => {

            if (isUrl(item.path)) {
                window.open(item.path)
                return
            }

            const newPath = item.children ? item.path : item.path.split('/')[0]
            const oldPath = unref(tabActive)

            tabActive.value = item.children ? item.path : item.path.split('/')[0]


            if (item.children) {

                permissionStore.setMenuTabRouters(

                    cloneDeep(item.children).map((v) => {
                        v.path = pathResolve(unref(tabActive), v.path)
                        return v
                    })
                )

                console.log(permissionStore.getMenuTabRouters)
            } else {
                push(item.path)
                permissionStore.setMenuTabRouters([])
                // showMenu.value = false
                // appStore.setFixedMenu(false)
            }

        }

        watch(
            () => routers.value,
            (routers: AppRouteRecordRaw[]) => {
                initTabMap(routers)
                filterMenusPath(routers, routers)
            },
            {
                immediate: true,
                deep: true
            }
        )



        return () => (
            <>
                <div className="p-5 flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-1 ">
                                {/* {(Array.isArray(menuRouters.value) && menuRouters.value.length > 0 ? menuRouters.value[0]?.meta?.title : 'Menu')} */}
                                <Icon icon="expand-up-down-fill" size={16} />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" className="w-64 p-1">
                            {
                                tabRouters.value.map((v) => {

                                    const item = (
                                        v.meta?.alwaysShow || (v?.children?.length && v?.children?.length > 1)
                                            ? v
                                            : {
                                                ...(v?.children && v?.children[0]),
                                                path: pathResolve(v.path, (v?.children && v?.children[0])?.path as string)
                                            }
                                    ) as AppRouteRecordRaw

                                    return (
                                        <DropdownMenuItem
                                            key={v.path}
                                            to={`/${v.path}`}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                                            onClick={() => tabClick(item)}
                                        >
                                            <Icon icon={item.meta.icon} size={16} />
                                            <span className="text-sm font-medium">{item.meta.title}</span>
                                        </DropdownMenuItem>
                                    )

                                })
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </>
        )

    }
})


</script>