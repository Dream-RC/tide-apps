<script lang="tsx">
import { pathResolve } from '@/common/utils/routerHelper';
import { Icon } from '@/components/chronos-ui/Icon';
import { useAppStore } from '@/store/modules/app';
import { usePermissionStore } from '@/store/modules/permission';
import './dock.scss'
import { isUrl } from '@/common/utils/is';
import { cloneDeep } from "lodash-es";
// import { filterMenusPath, initTabMap } from '../menu/src/helper';
import { CACHE_KEY, useCache } from '@/common/hooks/web/useCache';

const { wsCache } = useCache();


export default defineComponent({
    name: 'Dock',
    props: {},
    setup(props) {

        const appStore = useAppStore()

        const permissionStore = usePermissionStore()
        const { push, currentRoute } = useRouter()

        const routers = computed(() => permissionStore.getRouters)

        const tabRouters = computed(() => unref(routers).filter((v) => !v?.meta?.hidden))

        const tabActive = ref('')

        // ============================================================
        // 苹果 Dock 波浪联动效果
        // 思路：根据鼠标在 Dock 上的水平位置，对每个图标计算其中心到鼠标的距离，
        // 使用余弦衰减曲线得到 0~1 的放大因子，实时写入 CSS 变量 --dock-scale / --dock-y。
        // ============================================================
        const MAGNIFICATION = 1.25; // 鼠标正下方最大放大倍数（避免与相邻图标粘连）
        const AFFECT_RANGE = 150;   // 波浪影响半径（像素）
        const RISE_OFFSET = 12;     // 放大时的上升距离（像素）
        const PUSH_OFFSET = 10;     // 相邻图标水平避让距离（像素），远离鼠标方向
        const TARGET_THRESHOLD = 40; // 判定为“正下方”图标的距离阈值

        const dockListRef = ref<HTMLElement | null>(null);
        const hoverTargetIndex = ref<number | null>(null);
        const isExpanded = ref(true); // Dock 展开/收起状态

        // 距离 → 缩放 & 上升位移 & 水平推挤（余弦平滑衰减）
        // signedDistance：有符号距离，< 0 表示鼠标在图标的右侧，> 0 表示鼠标在图标的左侧
        const calcEffect = (signedDistance: number, isTarget: boolean): { scale: number; rise: number; push: number } => {
            const distance = Math.abs(signedDistance);
            if (distance >= AFFECT_RANGE) return { scale: 1, rise: 0, push: 0 };
            const t = distance / AFFECT_RANGE;              // 0 ~ 1
            const smooth = (Math.cos(t * Math.PI) + 1) / 2;  // 1 → 0，中间平滑
            // 目标图标自身不做水平推挤（0）；其他图标按方向远离鼠标
            const push = isTarget
                ? 0
                : (signedDistance > 0 ? 1 : -1) * PUSH_OFFSET * smooth;
            return {
                scale: 1 + (MAGNIFICATION - 1) * smooth,
                rise: RISE_OFFSET * smooth,
                push
            };
        };

        // 找到距离鼠标最近的图标（用于高亮阴影与指示点）
        const findTargetIndex = (mouseX: number): number => {
            const list = dockListRef.value;
            if (!list) return -1;
            const items = list.querySelectorAll<HTMLElement>('.dock-nav-item');
            let minDist = Infinity;
            let minIdx = -1;
            items.forEach((item, idx) => {
                const rect = item.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const dist = Math.abs(mouseX - centerX);
                if (dist < minDist) {
                    minDist = dist;
                    minIdx = idx;
                }
            });
            return minDist < TARGET_THRESHOLD ? minIdx : -1;
        };

        // 遍历所有图标，逐个更新 CSS 变量
        const updateDockItems = (mouseX: number | null) => {
            const list = dockListRef.value;
            if (!list) return;
            const items = list.querySelectorAll<HTMLElement>('.dock-nav-item');
            items.forEach((item, idx) => {
                if (mouseX === null) {
                    item.style.setProperty('--dock-scale', '1');
                    item.style.setProperty('--dock-y', '0px');
                    item.style.setProperty('--dock-x', '0px');
                    item.classList.remove('is-hover-target');
                    return;
                }
                const rect = item.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                // 注意：signedDistance = centerX - mouseX
                // 鼠标在图标左侧 → signedDistance > 0 → 向右推（push > 0）
                // 鼠标在图标右侧 → signedDistance < 0 → 向左推（push < 0）
                const { scale, rise, push } = calcEffect(
                    centerX - mouseX,
                    idx === hoverTargetIndex.value
                );
                item.style.setProperty('--dock-scale', scale.toFixed(3));
                item.style.setProperty('--dock-y', `${rise.toFixed(1)}px`);
                item.style.setProperty('--dock-x', `${push.toFixed(1)}px`);
                if (idx === hoverTargetIndex.value) {
                    item.classList.add('is-hover-target');
                } else {
                    item.classList.remove('is-hover-target');
                }
            });
        };

        const onMouseMove = (e: MouseEvent) => {
            hoverTargetIndex.value = findTargetIndex(e.clientX);
            updateDockItems(e.clientX);
        };

        const onMouseLeave = () => {
            hoverTargetIndex.value = null;
            updateDockItems(null);
        };

        // 点击伸缩图标：切换 dock-nav-list 的展开状态
        const onToggleDock = () => {
            isExpanded.value = !isExpanded.value;
        };

        const tabClick = (item: AppRouteRecordRaw) => {

            if (isUrl(item.path)) {
                window.open(item.path)
                return
            }

            // const newPath = item.children ? item.path : item.path.split('/')[0]
            // const oldPath = unref(tabActive)

            tabActive.value = item.children ? item.path : item.path.split('/')[0]

            if (item.children) {


                const resolvedChildren = cloneDeep(item.children).map((v: AppRouteRecordRaw) => {
                    v.path = pathResolve(unref(tabActive), v.path)
                    return v
                })

                permissionStore.setMenuTabRouters(resolvedChildren)
                wsCache.set(CACHE_KEY.TAB_MENU_ROUTERS, permissionStore.getMenuTabRouters)

                push(resolvedChildren[0].children ? resolvedChildren[0].children[0] : resolvedChildren[0])

            } else {

                permissionStore.setMenuTabRouters([])
                wsCache.set(CACHE_KEY.TAB_MENU_ROUTERS, []);
                push(item.path)
            }

        }

        // watch(
        //     () => routers.value,
        //     (routers: AppRouteRecordRaw[]) => {
        //         console.log(routers)

        //         initTabMap(routers)
        //         filterMenusPath(routers, routers)
        //     },
        //     {
        //         immediate: true,
        //         deep: true
        //     }
        // )


        return () => (
            <>
                <div class={'dock-box'}>
                    <div class="dock-click" onClick={onToggleDock}>
                        <div
                            class={[
                                'dock-toggle',
                                isExpanded.value ? 'is-expanded' : 'is-collapsed'
                            ]}
                            title={isExpanded.value ? '收起 Dock' : '展开 Dock'}
                        >
                            {/* Chevron SVG：展开态指向下，收起态通过 CSS 旋转指向上 */}
                            <svg viewBox="0 0 12 12" focusable="false" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.60214 4C9.49304 4 9.93921 5.07714 9.30925 5.70711L6.75918 8.25717C6.36866 8.6477 5.73549 8.6477 5.34497 8.25717L2.7949 5.70711C2.16493 5.07714 2.6111 4 3.502 4H8.60214Z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div
                        class={[
                            'dock-nav-list',
                            isExpanded.value ? '' : 'is-collapsed'
                        ]}
                        ref={(el: any) => (dockListRef.value = el)}
                        onMousemove={onMouseMove}
                        onMouseleave={onMouseLeave}
                    >
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
                                    <div class="dock-nav-item" onClick={() => tabClick(item)}>

                                        <div class="dock-nav-item-icon">
                                            <Icon icon={item.meta.icon} size={30} class="dock-icon" />
                                        </div>

                                        <div class="dock-nav-item-indicator" />
                                    </div>
                                )

                            })
                        }

                    </div>
                </div>
            </>
        )

    }


})


</script>