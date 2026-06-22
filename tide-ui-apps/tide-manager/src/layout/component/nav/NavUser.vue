<script lang="tsx">
import { Card } from "@/components/ui/card";
import TopBreadcrumb from "../breadcrumb/TopBreadcrumb.vue";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { CACHE_KEY, useCache } from "@/common/hooks/web/useCache";
import { getAccessToken } from "@/common/utils/auth";

export default defineComponent({
    name: 'NavUser',

    setup() {




        const { wsCache } = useCache();
        const userInfo = wsCache.get(CACHE_KEY.USER);

        console.log(userInfo.user);

        return () => (
            <>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                                <SidebarMenuButton
                                    size="lg"
                                    class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar class="h-8 w-8 rounded-lg grayscale">
                                        {/* :alt="user.name" */}
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                        <AvatarFallback class="rounded-lg">
                                            CN
                                        </AvatarFallback>
                                    </Avatar>
                                    <div class="grid flex-1 text-left text-sm leading-tight">
                                        <span class="truncate font-medium">{userInfo.user.nickname}</span>
                                        <span class="text-muted-foreground truncate text-xs">
                                            m@example.com
                                        </span>
                                    </div>
                                    {/* <IconDotsVertical class="ml-auto size-4" /> */}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu >
            </>
        )

    }
})



</script>
