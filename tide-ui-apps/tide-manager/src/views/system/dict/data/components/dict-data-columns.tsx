import type { ColumnDef } from "@tanstack/vue-table";
import { DictDataSchema } from "../data/dict-data-schema";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/chronos-ui/Icon";
import { formatDate } from "@/common/utils/formatTime";
import { DictTag } from "@/components/chronos-ui/dict-tag";
import { DICT_TYPE } from "@/common/utils/dict";

export const dictDataColumns = (
    openDataForm?: (type: string, id?: string) => void,
): ColumnDef<DictDataSchema>[] => [
    {
        accessorKey: "name",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={""}>名称</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="table-colums-common text-center">
                    <span className={""}>{getValue<boolean>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "dictType",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={"ml-2"}>字典编码</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="table-colums-common text-center text-muted-foreground">
                    <span className={""}>{getValue<boolean>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: "value",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={"ml-2"}>字典键值</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div
                    className="text-center"
                    style={{ paddingLeft: `${(row.depth)}rem` }}
                >
                    <span className={"mx-2"}>{getValue<boolean>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: "sort",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={"ml-2"}>排序</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div
                    className="text-center"
                    style={{ paddingLeft: `${(row.depth)}rem` }}
                >
                    <span className={"mx-2"}>{getValue<boolean>()}</span>
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
                            openDataForm("update", row.original.id);
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
export default dictDataColumns;
