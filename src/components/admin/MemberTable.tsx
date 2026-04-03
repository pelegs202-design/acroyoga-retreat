'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { AdminMember } from './AdminPanel';
import { MemberActionButtons } from './MemberActionButtons';

type Props = {
  members: AdminMember[];
  onMemberUpdate: () => void;
};

const columnHelper = createColumnHelper<AdminMember>();

export function MemberTable({ members, onMemberUpdate }: Props) {
  const t = useTranslations('admin.members');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [hostsOnly, setHostsOnly] = useState(false);

  // Build unique city/role/level lists for filter dropdowns
  const cities = useMemo(
    () => [...new Set(members.map((m) => m.city).filter(Boolean) as string[])].sort(),
    [members],
  );
  const roles = ['base', 'flyer', 'both'];
  const levels = ['beginner', 'intermediate', 'advanced'];

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('name'),
        cell: (info) => <span className="font-medium text-neutral-100">{info.getValue()}</span>,
      }),
      columnHelper.accessor('email', {
        header: t('email'),
        cell: (info) => <span className="text-neutral-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('city', {
        header: t('city'),
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.accessor('role', {
        header: t('role'),
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.accessor('level', {
        header: t('level'),
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.accessor('status', {
        header: t('status'),
        cell: (info) => {
          const status = info.getValue();
          return status === 'active' ? (
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-green-500" />
              <span className="text-green-400">{t('statusActive')}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-500" />
              <span className="text-red-400">{t('statusSuspended')}</span>
            </span>
          );
        },
      }),
      columnHelper.accessor('isJamHost', {
        header: t('host'),
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded bg-pink-900/60 px-1.5 py-0.5 text-xs font-medium text-pink-300">
              {t('host')}
            </span>
          ) : null,
      }),
      columnHelper.accessor('createdAt', {
        header: t('joined'),
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString('en-IL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
      }),
      columnHelper.display({
        id: 'actions',
        header: t('actions'),
        cell: (info) => (
          <MemberActionButtons member={info.row.original} onUpdate={onMemberUpdate} />
        ),
      }),
    ],
    [t, onMemberUpdate],
  );

  // Apply hosts-only filter on top of TanStack filters
  const filteredData = useMemo(
    () => (hostsOnly ? members.filter((m) => m.isJamHost) : members),
    [members, hostsOnly],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _colId, filterValue) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.name.toLowerCase().includes(search) ||
        row.original.email.toLowerCase().includes(search)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const getColumnFilter = (colId: string) =>
    (columnFilters.find((f) => f.id === colId)?.value as string) ?? '';

  const setColumnFilter = (colId: string, value: string) => {
    setColumnFilters((prev) => {
      const without = prev.filter((f) => f.id !== colId);
      return value ? [...without, { id: colId, value }] : without;
    });
  };

  return (
    <div>
      {/* Search + filters */}
      <div className="mb-4 space-y-3">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={t('search')}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-brand focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <select
            value={getColumnFilter('status')}
            onChange={(e) => setColumnFilter('status', e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 focus:outline-none"
          >
            <option value="">{t('filterStatus')}: All</option>
            <option value="active">{t('statusActive')}</option>
            <option value="suspended">{t('statusSuspended')}</option>
          </select>

          {/* City filter */}
          <select
            value={getColumnFilter('city')}
            onChange={(e) => setColumnFilter('city', e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 focus:outline-none"
          >
            <option value="">{t('filterCity')}: All</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Role filter */}
          <select
            value={getColumnFilter('role')}
            onChange={(e) => setColumnFilter('role', e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 focus:outline-none"
          >
            <option value="">{t('filterRole')}: All</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Level filter */}
          <select
            value={getColumnFilter('level')}
            onChange={(e) => setColumnFilter('level', e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 focus:outline-none"
          >
            <option value="">{t('filterLevel')}: All</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Hosts-only toggle */}
          <button
            onClick={() => setHostsOnly((v) => !v)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              hostsOnly
                ? 'border-pink-500 bg-pink-900/40 text-pink-300'
                : 'border-neutral-700 text-neutral-400 hover:text-neutral-100'
            }`}
          >
            {hostsOnly ? t('hostsOnly') : t('allMembers')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400 ${
                        header.column.getCanSort() ? 'cursor-pointer select-none hover:text-neutral-200' : ''
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && ' ↑'}
                        {header.column.getIsSorted() === 'desc' && ' ↓'}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-neutral-500"
                  >
                    {t('noMembers')}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-2 text-xs text-neutral-600">
        {table.getRowModel().rows.length} / {members.length} members
      </p>
    </div>
  );
}
