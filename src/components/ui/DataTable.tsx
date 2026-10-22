import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Inbox,
  X,
} from 'lucide-react';
import CustomButton from './CustomButton';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: React.ReactNode;
  enableExport?: boolean;
  exportFileName?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data: dataProp = [],
  keyField = 'id' as keyof T,
  title,
  searchable = true,
  searchPlaceholder = 'Search records...',
  pageSizeOptions = [5, 10, 25, 50],
  defaultPageSize = 10,
  selectable = false,
  onSelectionChange,
  isLoading = false,
  emptyMessage = 'No records found matching your criteria.',
  actions,
  enableExport = true,
  exportFileName = 'table-export',
  className = '',
}: DataTableProps<T>) {
  // Defensive: a non-array (e.g. an API error payload) renders as an empty table
  const data = useMemo(() => (Array.isArray(dataProp) ? dataProp : []), [dataProp]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(query)
      )
    );
  }, [data, searchQuery]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handle Sort Toggle
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Row Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSet = new Set(paginatedData.map((row) => row[keyField]));
      setSelectedIds(newSet);
      onSelectionChange?.(paginatedData);
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row: T) => {
    const rowId = row[keyField];
    const newSet = new Set(selectedIds);
    if (newSet.has(rowId)) {
      newSet.delete(rowId);
    } else {
      newSet.add(rowId);
    }
    setSelectedIds(newSet);
    const selectedRows = data.filter((item) => newSet.has(item[keyField]));
    onSelectionChange?.(selectedRows);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((col) => `"${col.header}"`).join(',');
    const rows = sortedData.map((row) =>
      columns
        .map((col) => {
          const val = row[col.key as keyof T];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allOnPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedIds.has(row[keyField]));

  const someOnPageSelected =
    paginatedData.some((row) => selectedIds.has(row[keyField])) && !allOnPageSelected;

  return (
    <div className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col ${className}`}>
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {title && (
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              {title}
            </h3>
          )}
          {selectable && selectedIds.size > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {searchable && (
            <div className="relative min-w-[200px] sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {enableExport && (
            <CustomButton
              variant="outline"
              size="xs"
              leftIcon={<Download className="w-3 h-3" />}
              onClick={handleExportCSV}
              disabled={data.length === 0}
            >
              Export
            </CustomButton>
          )}

          {actions}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {selectable && (
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someOnPageSelected;
                    }}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
              )}

              {columns.map((column) => {
                const isSorted = sortKey === column.key;
                const alignClass =
                  column.align === 'right'
                    ? 'text-right'
                    : column.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={String(column.key)}
                    style={{ width: column.width }}
                    className={`py-3 px-4 ${alignClass} ${
                      column.sortable ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-100' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        column.align === 'right'
                          ? 'justify-end'
                          : column.align === 'center'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {selectable && <td className="py-3 px-4"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>}
                  {columns.map((col, cIdx) => (
                    <td key={`sc-${cIdx}`} className="py-3 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Populated Rows
              paginatedData.map((row, index) => {
                const isSelected = selectedIds.has(row[keyField]);
                return (
                  <tr
                    key={String(row[keyField] ?? index)}
                    className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                      isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row)}
                          aria-label={`Select row ${index + 1}`}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((column) => {
                      const alignClass =
                        column.align === 'right'
                          ? 'text-right'
                          : column.align === 'center'
                          ? 'text-center'
                          : 'text-left';

                      return (
                        <td
                          key={String(column.key)}
                          className={`py-3 px-4 ${alignClass}`}
                        >
                          {column.render
                            ? column.render(row, (currentPage - 1) * pageSize + index)
                            : String(row[column.key as keyof T] ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Rows per page"
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <span className="font-mono tabular-nums">
            Showing{' '}
            {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Previous page"
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 py-1 font-mono tabular-nums text-slate-700 dark:text-slate-200 font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Next page"
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
