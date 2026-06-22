// src/components/chronos-ui/table/use-data-table.ts
import type { ColumnDef, Table } from "@tanstack/vue-table";
import {
    getCoreRowModel,
    getExpandedRowModel,
    useVueTable,
} from "@tanstack/vue-table";

export interface UseDataTableProps<data, value> {
    columns: ColumnDef<data, value>[];
    data: () => data[]; // Accept a function that returns data
    getSubRows?: (originalRow: data, index: number) => undefined | data[];
}

export const useDataTable = <data, value>(
    props: UseDataTableProps<data, value>,
) => {
    const table: Table<data> = useVueTable({
        data: computed(props.data), // Use computed to react to data changes
        columns: props.columns,
        getSubRows: props.getSubRows,
        getExpandedRowModel: getExpandedRowModel(),
        getCoreRowModel: getCoreRowModel(),
    });

    return table;
};