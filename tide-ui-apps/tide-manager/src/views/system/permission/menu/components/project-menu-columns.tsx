import type { ColumnDef } from "@tanstack/vue-table";
import Icon from "@/components/chronos-ui/Icon/src/Icon.vue";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/common/utils/formatTime";
import { DictTag } from "@/components/chronos-ui/dict-tag";
import { DICT_TYPE } from "@/common/utils/dict";
import { ProjectMenuSchema } from "../data/project-menu-schema";

export const projectMenuColumns = (): ColumnDef<ProjectMenuSchema>[] => [
    {
        accessorKey: "name",
        header: ({ table }) => (
            <div className={"text-left"}>
                <span className={"ml-10"}>名称</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="text-left table-title">
                    {row.getCanExpand() && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // 防止事件冒泡
                                row.getToggleExpandedHandler()?.();
                            }}
                            className="mr-2 p-1"
                        >
                            {row.getIsExpanded()
                                ? (
                                    <Icon
                                        className={"text-red-500"}
                                        icon={"shang1"}
                                        size={18}
                                    />
                                )
                                : (
                                    <Icon
                                        className={"text-indigo-500"}
                                        icon={"xia1"}
                                        size={18}
                                    />
                                )}
                        </button>
                    )}
                    <span className={"mx-2"}>{getValue<boolean>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: "icon",
        header: "图标",
        size: 160,
        cell: ({ row }) => {
            return (
                <div className="flex justify-center items-center">
                    <Icon icon={row.getValue("icon")} size={18} />
                </div>
            );
        },
    },
    {
        accessorKey: "type",
        header: "类型",
        size: 160,
        cell: ({ row }) => (
            <>
                <div className="text-center">
                    {row.original.type === 1 && (
                        <DictTag
                            type={DICT_TYPE.SYSTEM_MENU_TYPE}
                            value={row.original.type}
                            className=""
                        />
                    )}
                    {row.original.type === 2 && (
                        <DictTag
                            type={DICT_TYPE.SYSTEM_MENU_TYPE}
                            value={row.original.type}
                        />
                    )}
                    {row.original.type === 3 && (
                        <DictTag
                            type={DICT_TYPE.SYSTEM_MENU_TYPE}
                            value={row.original.type}
                        />
                    )}
                </div>
            </>
        ),
    },
    {
        accessorKey: "permission",
        header: "权限标识",
        size: 160,
        cell: ({ row }) => (
            <>
                <div className="text-center font-mono text-xs text-muted-foreground">
                    {row.original.permission}
                </div>
            </>
        ),
    },
    {
        accessorKey: "sort",
        header: "排序",
        size: 160,
        cell: ({ row }) => (
            <>
                <div className="text-center font-mono text-xs text-muted-foreground">
                    {row.original.sort}
                </div>
            </>
        ),
    },
    {
        accessorKey: "component-name",
        header: "组件名称",
        size: 160,
        cell: ({ row }) => (
            <>
                <div className="text-center font-mono text-xs text-muted-foreground">
                    {row.original.componentName}
                </div>
            </>
        ),
    },
    {
        accessorKey: "component",
        header: "组件路径",
        size: 200,
        cell: ({ row }) => (
            <>
                <div className="w-[180px] text-center font-mono text-xs text-muted-foreground">
                    {row.original.component}
                </div>
            </>
        ),
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
                            e.stopPropagation(); // 阻止事件冒泡，防止影响行展开
                            // openForm("update", row.original.id);
                        }}
                    >
                        <Icon icon="xiugai1" size={20} />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡，防止影响行展开
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
export default {
    projectMenuColumns,
};
