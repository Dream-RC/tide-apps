import type { ColumnDef } from "@tanstack/vue-table";
import Icon from "@/components/chronos-ui/Icon/src/Icon.vue";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/common/utils/formatTime";
import { DictTag } from "@/components/chronos-ui/dict-tag";
import { DICT_TYPE } from "@/common/utils/dict";
import { StorageConfigSchema } from "../data/storage-config-schema";

export const storageConfigColumns = (
    openForm?: (type: string, id?: string) => void,
): ColumnDef<StorageConfigSchema>[] => [
    {
        accessorKey: "name",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={"ml-2"}>名称</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="text-center">
                    <span className={"mx-2"}>{getValue<string>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "storage",
        header: "存储器",
        size: 160,
        cell: ({ row }) => (
            <>
                <div className="text-center">
                    {row.original.storage === 10 && (
                        <DictTag
                            type={DICT_TYPE.STORAGE_CONFIG}
                            value={row.original.storage}
                            className=""
                        />
                    )}
                </div>
            </>
        ),
    },
    {
        accessorKey: "description",
        header: ({ table }) => (
            <div className={"text-center"}>
                <span className={"ml-2"}>描述</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="text-center">
                    <span className={"mx-2"}>{getValue<string>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
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
export default storageConfigColumns;
