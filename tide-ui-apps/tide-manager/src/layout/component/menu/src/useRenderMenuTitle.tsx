import type { RouteMeta } from "vue-router";
// import "@/layout/style/index.scss"
import Icon from "@/components/chronos-ui/Icon/src/Icon.vue";

export const useRenderMenuTitle = () => {
    const renderMenuTitle = (meta: RouteMeta) => {
        const { title = "", icon } = meta;

        return icon
            ? (
                <div class={"flex items-center gap-4"}>
                    {/* #FF4D4F FE8F66  50DFB2  ac7fe4 FF4D4F  5D87FF 5147FF  B3B4B6*/}
                    {/* color="#80828a" */}
                    <Icon icon={meta.icon} size={18} />
                    <span class="menu-title">
                        {/* text-muted-foreground  */}
                        {title}
                    </span>
                </div>
            )
            : (
                <span class="menu-title">
                    {title}
                </span>
            );
    };

    return {
        renderMenuTitle,
    };
};
