"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  embedded?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  showPagination?: boolean;
  showSearch?: boolean;
  toolbar?: ReactNode;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  embedded = false,
  emptyMessage = "No records found.",
  isLoading = false,
  pageSize = 10,
  searchPlaceholder = "Search records...",
  showPagination = true,
  showSearch = true,
  toolbar,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // TanStack Table intentionally returns function-heavy instances; keep the suppression local to this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      sorting,
    },
  });

  return (
    <div
      className={
        embedded
          ? "overflow-hidden bg-white"
          : "overflow-hidden rounded-[14px] border border-[var(--border)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
      }
    >
      {showSearch || toolbar ? (
        <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
          {showSearch ? (
            <label className="relative block w-full min-w-0 md:w-80 md:flex-none">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                className="block h-10 w-full min-w-0 rounded-lg border border-[var(--border-strong)] bg-white py-2 pl-10 pr-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[rgba(229,72,77,0.12)]"
                onChange={(event) => setGlobalFilter(event.target.value)}
                placeholder={searchPlaceholder}
                type="search"
                value={globalFilter}
              />
            </label>
          ) : null}
          {toolbar ? <div className="flex min-w-0 items-center gap-2">{toolbar}</div> : null}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const direction = header.column.getIsSorted();

                  return (
                    <th className="border-b border-[var(--border)] px-4 py-3 font-semibold" key={header.id}>
                      {header.isPlaceholder ? null : (
                        <button
                          className={`inline-flex items-center gap-1.5 text-left ${sortable ? "cursor-pointer hover:text-[var(--text)]" : "cursor-default"}`}
                          disabled={!sortable}
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortable ? (
                            direction === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : direction === "desc" ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                            )
                          ) : null}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-white text-[var(--text)]">
            {isLoading ? (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-[var(--muted)]" colSpan={columns.length}>
                  Loading records...
                </td>
              </tr>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr className="transition hover:bg-[var(--surface-2)]/70" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td className="px-4 py-3 align-middle" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-[var(--muted)]" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination ? (
        <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <span>
            {table.getFilteredRowModel().rows.length} of {data.length} records
          </span>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Previous page"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              type="button"
              variant="secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <Button
              aria-label="Next page"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              type="button"
              variant="secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
