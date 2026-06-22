import type { ColumnDef } from "@tanstack/vue-table";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/chronos-ui/Icon";
import { formatDate } from "@/common/utils/formatTime";
import { DictTag } from "@/components/chronos-ui/dict-tag";
import { DICT_TYPE } from "@/common/utils/dict";
import { FileSchema } from "../data/file-schema";
import { fileSizeFormatter } from "@/common/utils/file";

export const storageFileColumns = (
    openForm?: (type: string, id?: string) => void,
): ColumnDef<FileSchema>[] => [
    {
        accessorKey: "preview",
        header: "文件内容",
        size: 100,
        cell: ({ row }) => {
            const isImage = row.original.type?.startsWith("image/");
            return (
                <div className="flex justify-center items-center h-16">
                    {isImage
                        ? (
                            <img
                                src={row.original.url}
                                alt={row.original.name}
                                className="max-w-[80px] max-h-[60px] object-contain rounded-md border border-border"
                                loading="lazy"
                            />
                        )
                        : (
                            <Icon
                                icon="lucide:file"
                                className="w-8 h-8 text-muted-foreground"
                            />
                        )}
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: ({ table }) => (
            <div className={"text-center max-w-[200px]"}>
                <span className={"ml-2"}>名称</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="text-center max-w-[200px] truncate text-muted-foreground">
                    <span className={"mx-2 xs"}>{getValue<boolean>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "path",
        header: ({ table }) => (
            <div className={"text-center max-w-[200px]"}>
                <span className={"ml-2"}>文件路径</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="text-center max-w-[200px] truncate text-xs text-muted-foreground">
                    <span className={"mx-2"}>{getValue<boolean>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: "url",
        header: ({ table }) => (
            <div className={"text-center max-w-[200px]"}>
                <span className={"ml-2"}>URL</span>
            </div>
        ),
        cell: ({ row, getValue }) => {
            return (
                <div className="text-center max-w-[200px] truncate text-xs text-muted-foreground">
                    <span className={"mx-2"}>{getValue<boolean>()}</span>
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: "size",
        header: ({ table }) => (
            <div className={"text-center "}>
                <span className={"ml-2"}>文件大小</span>
            </div>
        ),
        size: 120,
        cell: ({ row, getValue }) => (
            <div className="text-center font-mono text-xs text-muted-foreground">
                {fileSizeFormatter(row.original.size)}
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },

    {
        accessorKey: "type",
        header: ({ table }) => (
            <div className={"text-sm text-center"}>
                <span className={"ml-2"}>文件类型</span>
            </div>
        ),
        size: 150,
        cell: ({ row }) => (
            <div
                className="text-xs text-center"
                title={row.original.type}
            >
                <span className="text-center font-mono text-xs text-muted-foreground">
                    {row.original.type}
                </span>
            </div>
        ),
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
export default storageFileColumns;
