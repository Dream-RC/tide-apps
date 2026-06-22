<script lang="tsx">
import { usePermissionStore } from '@/store/modules/permission';
import { filterBreadcrumb } from './src/helper';
import { filter, treeToList } from '@/common/utils/tree';
import type { RouteLocationNormalizedLoaded, RouteMeta } from 'vue-router'
import { useRouter } from 'vue-router'
import {
    Breadcrumb, BreadcrumbItem,
    BreadcrumbSeparator, BreadcrumbList
} from '@/components/ui/breadcrumb';
import { ChevronDown, Slash, ChevronRight } from 'lucide-vue-next'

import TapMenu from '../menu/TapMenu.vue';

export default defineComponent({
    name: 'TopBreadcrumb',

    setup() {

        const router = useRouter()
        const { currentRoute } = router
        const levelList = ref<AppRouteRecordRaw[]>([])

        const permissionStore = usePermissionStore()

        const menuRouters = computed(() => {
            const routers = permissionStore.getRouters
            return filterBreadcrumb(routers)
        })

        // console.log(menuRouters.value)
        const getBreadcrumb = () => {
            const currentPath = currentRoute.value.matched.slice(-1)[0].path

            levelList.value = filter<AppRouteRecordRaw>(unref(menuRouters), (node: AppRouteRecordRaw) => {
                return node.path === currentPath
            })
        }

        watch(
            () => currentRoute.value,
            (route: RouteLocationNormalizedLoaded) => {
                if (route.path.startsWith('/redirect/')) {
                    return
                }
                getBreadcrumb()
            },
            {
                immediate: true
            }
        )

        const renderBreadcrumb = () => {

            const breadcrumbList = treeToList<AppRouteRecordRaw[]>(unref(levelList))

            console.log(breadcrumbList)

            return breadcrumbList.map((v) => {
                const disabled = !v.redirect || v.redirect === 'noredirect'
                const meta = v.meta as RouteMeta
                return (
                    <BreadcrumbItem>
                        <div class="flex items-center">
                            {v?.meta?.title}
                        </div>
                        <BreadcrumbSeparator>
                            <Slash />
                        </BreadcrumbSeparator>
                    </BreadcrumbItem>
                )
            })
        }


        return () => (
            <>
                <Breadcrumb>
                    <BreadcrumbList>
                        {renderBreadcrumb()}
                    </BreadcrumbList>
                </Breadcrumb>

                <TapMenu />
            </>
        )
    }
})
</script>