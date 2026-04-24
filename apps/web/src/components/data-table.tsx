"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  setPagination?: (pagination: { pageIndex: number; pageSize: number }) => void;
  loadMore?: () => void;
  isLoading?: boolean;
  filters?: React.ReactNode;
}

function TableContent<TData, TValue>({
  table,
  columns,
  isLoading,
}: {
  table: ReturnType<typeof useReactTable<TData>>;
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loadMore,
  isLoading = false,
  filters,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const loadMoreButton = loadMore && (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button variant="outline" size="sm" onClick={loadMore} disabled={isLoading}>
        Load More
      </Button>
    </div>
  );

  if (filters) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-80 flex-shrink-0">{filters}</div>
          <div className="flex-1">
            <TableContent table={table} columns={columns} isLoading={isLoading} />
            {loadMoreButton}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TableContent table={table} columns={columns} isLoading={isLoading} />
      {loadMoreButton}
    </div>
  );
}
