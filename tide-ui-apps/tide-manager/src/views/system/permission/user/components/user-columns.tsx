import type { ColumnDef } from "@tanstack/vue-table";
import Icon from "@/components/chronos-ui/Icon/src/Icon.vue";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/common/utils/formatTime";
import { DictTag } from "@/components/chronos-ui/dict-tag";
import { DICT_TYPE } from "@/common/utils/dict";
import { UserSchema } from "../data/user-schema";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { UserVo } from "@/common/api/system/permission/user";

export const userColumns = (
    openForm?: (type: string, id?: string) => void,
    openAssignRoleForm?: (row: UserVo) => void,
): ColumnDef<UserSchema>[] => [
    {
        accessorKey: "username",
        header: ({ table }) => (
            <div class={"text-center"}>
                <span class={""}>用户名称</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div class="text-center">
                    <span class="text-sm font-medium ">
                        {getValue<string>() || "-"}
                    </span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "mobile",
        header: ({ table }) => (
            <div class={"text-center"}>
                <span class={""}>手机号</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div class="text-center">
                    <span class="text-sm font-medium ">
                        {getValue<string>() || "-"}
                    </span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "status",
        header: "状态",
        size: 160,
        cell: ({ row }) => (
            <>
                <div className="text-center">
                    {row.original.status === 0 && (
                        <DictTag
                            type={DICT_TYPE.COMMON_STATUS}
                            value={row.original.status}
                        />
                    )}
                    {row.original.status === 1 && (
                        <DictTag
                            type={DICT_TYPE.COMMON_STATUS}
                            value={row.original.status}
                        />
                    )}
                </div>
            </>
        ),
    },
    {
        accessorKey: "create-time",
        header: "注册时间",
        size: 160,
        cell: ({ row }) => (
            <>
                <div class="text-center font-mono text-xs text-muted-foreground">
                    {formatDate(new Date(row.original.createTime))}
                </div>
            </>
        ),
    },
    {
        id: "actions",
        header: "操作",
        meta: { sticky: "right" },
        size: 200,
        // cell: ({ row }) => <DataTableRowActions row={row} isRemote={false} schemas={menuSchema} />,
        cell: ({ row }) => {
            //   const { setInfo } = useContext(TableContext)
            return (
                <div class=" gap-3 flex justify-center items-center">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            // e.stopPropagation(); // 阻止事件冒泡，防止影响行展开
                            openForm("update", row.original.id);
                        }}
                    >
                        <Icon icon="xiugai1" size={20} />
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            openAssignRoleForm?.(row.original);
                        }}
                    >
                        分配角色
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            // e.stopPropagation(); // 阻止事件冒泡，防止影响行展开
                        }}
                    >
                        <Icon icon="shanchu-white" size={20} />
                    </Button>
                </div>
            );
        },
    },
];

// 添加默认导出
export default userColumns;