import type { ColumnDef } from "@tanstack/vue-table";
import Icon from "@/components/chronos-ui/Icon/src/Icon.vue";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/common/utils/formatTime";
import { DictTag } from "@/components/chronos-ui/dict-tag";
import { DICT_TYPE } from "@/common/utils/dict";
import { MemberUserSchema } from "../data/member-user-schema";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const memberUserColumns = (
    openForm?: (type: string, id?: string) => void,
): ColumnDef<MemberUserSchema>[] => [
    {
        accessorKey: "avatar",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={""}>会员信息</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            const user = row.original;
            return (
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 h-full">
                        <Avatar className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <AvatarImage
                                src={getValue<boolean>()}
                                className="w-full h-full object-cover"
                            />
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium ">
                                {user.nickname || "-"}
                            </span>
                        </div>
                    </div>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "mobile",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={"ml-2"}>手机号</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="text-center text-xs text-muted-foreground">
                    <span className={""}>{getValue<boolean>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "levelName",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={"ml-2"}>
                    等级
                </span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="text-center text-xs text-muted-foreground">
                    <span className={""}>{getValue<boolean>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: "point",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={"ml-2 "}>积分</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="text-center text-xs text-muted-foreground">
                    <span className={""}>{getValue<boolean>()}</span>
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
        header: "创建时间",
        size: 160,
        cell: ({ row }) => (
            <>
                <div className="text-center font-mono text-xs text-muted-foreground">
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
                <div className=" gap-3 flex justify-center items-center">
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
export default memberUserColumns;
