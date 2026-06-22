<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type ColumnDef, FlexRender, type Table as VueTable } from "@tanstack/vue-table";

defineOptions({ name: 'MemberUserTable' })

interface DateTableProps<T, V> {
    table: VueTable<T>;
    columns: ColumnDef<T, V>[];
}

const props = defineProps<DateTableProps<any, any>>();


</script>

<template>
    <div class="overflow-hidden rounded-lg border">
        <Table key="table" className="table-fixed" v-if="table">
            <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                    <TableHead v-for="header in headerGroup.headers" :key="header.id"
                        :style="{ width: header.getSize() }" :col-span="header.colSpan" :class="cn(
                            'text-center',
                            header.column.id === 'actions' &&
                            'sticky right-0 z-30 '
                        )">
                        <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                <template v-if="table.getRowModel().rows.length">
                    <template v-for="row in table.getRowModel().rows" :key="row.id">
                        <TableRow className="py-2">
                            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" :style="{
                                width: cell.column.getSize(),
                            }" :class="cn(
                                'py-2',
                                cell.column.id === 'actions' &&
                                'sticky right-0 z-20'
                            )">
                                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                            </TableCell>
                        </TableRow>
                    </template>
                </template>
                <TableRow v-else>
                    <TableCell :col-span="columns.length" className="h-24 text-center">
                        No results.
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>

</template>