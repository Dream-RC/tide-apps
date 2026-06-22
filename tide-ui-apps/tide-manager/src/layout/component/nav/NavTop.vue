<script lang="tsx">
import { Card } from "@/components/ui/card";
import TopBreadcrumb from "../breadcrumb/TopBreadcrumb.vue";
import Dock from "../dock/dock.vue";

export default defineComponent({
    name: 'NavTop',

    setup() {


        return () =>
        (<>
            <Dock />
            <div className="layout-top-bar">
                {/* w-screen shadow-sm rounded-xl border */}
                <div className="top-container">
                    {/* 左侧- 图标 */}
                    <div className="container-box">
                        <span className="font-medium">Chronos</span>
                        {/* <TopBreadcrumb /> */}
                    </div>

                    {/* 中间- 菜单列表 */}
                    <div className="container-box">
                    </div>

                    {/* 右侧- 面包屑 flex items-center space-x-6*/}
                    <div className="container-box">
                        <span className="text-sm text-gray-600">Docs</span>
                        <span className="text-sm text-gray-600">Support</span>
                        <div className="h-8 w-8 rounded-full  flex items-center justify-center">
                            <span className="text-sm font-medium">U</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
        )

    }
})



</script>
