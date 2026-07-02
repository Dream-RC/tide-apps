<script lang="tsx">
import { Card } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import TopBreadcrumb from "../breadcrumb/TopBreadcrumb.vue";

export default defineComponent({
    name: 'NavTop',

    setup() {


        return () =>
        (<>
            <div class="nav-top">
                <div class="nav-top-container">
                    {/* 左侧- 图标 */}
                    <div class="nav-top-left">
                        <SidebarTrigger class="nav-trigger" />
                        <span class="nav-brand">Chronos</span>
                        {/* <TopBreadcrumb /> */}
                    </div>

                    {/* 中间- 菜单列表 */}
                    <div class="nav-top-center">
                    </div>

                    {/* 右侧- 操作区 */}
                    <div class="nav-top-right">
                        <span class="nav-link">Docs</span>
                        <span class="nav-link">Support</span>
                        <div class="nav-avatar">
                            <span class="nav-avatar-text">U</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
        )

    }
})



</script>

<style lang="scss" scoped>
.nav-top {
    position: sticky;
    top: 0;
    z-index: 50;
    // padding: 12px 20px 0;
}

.nav-top-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 20px;
    background: hsl(var(--background) / 0.6);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: 1px solid hsl(var(--border) / 0.5);
    border-radius: 16px;
    box-shadow:
        0 1px 0 0 hsl(var(--background) / 0.4) inset,
        0 4px 24px -8px hsl(0 0% 0% / 0.12);
    transform: translateZ(0);
}

.nav-top-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.nav-brand {
    font-size: 15px;
    font-weight: 500;
    color: var(--foreground);
    letter-spacing: -0.02em;
    user-select: none;
    opacity: 0.9;
}

.nav-top-center {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1;
    justify-content: center;
}

.nav-top-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.nav-link {
    font-size: 13px;
    font-weight: 450;
    color: hsl(var(--muted-foreground) / 0.7);
    cursor: pointer;
    transition: color 0.25s ease;
    letter-spacing: -0.01em;
}

.nav-link:hover {
    color: var(--foreground);
}

.nav-avatar {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: hsl(var(--foreground) / 0.08);
    border: 1px solid hsl(var(--border) / 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.25s ease, border-color 0.25s ease;
}

.nav-avatar:hover {
    background: hsl(var(--foreground) / 0.12);
    border-color: hsl(var(--border) / 0.6);
}

.nav-avatar-text {
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
    opacity: 0.7;
}
</style>