import { useState, useEffect, useMemo } from 'react';
import { 
  flexRender, 
  getCoreRowModel, 
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState
} from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowUpDown, ChevronDown, Search, Filter, Download, Trash2, 
  MoreHorizontal, Eye, Edit, FileText, Star, Archive, 
  Calendar as CalendarIcon, Clock, CheckCircle, XCircle, 
  AlertCircle, Play, RefreshCw, Tags, Folder
} from 'lucide-react';
import { format, formatDistanceToNow, subDays, subWeeks, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';


interface Report {
  id: string;
  title: string;
  template_type: string;
  created_at: string;
  original_document_name?: string;
  status: 'success' | 'failed' | 'processing';
  processing_time?: number;
  file_size?: number;
  is_favorited?: boolean;
  is_archived?: boolean;
  tags?: string[];
  folder?: string;
  content_preview?: string;
}

interface ReportsDataTableProps {
  reports: Report[];
  onViewReport: (reportId: string) => void;
  onDeleteReports: (reportIds: string[]) => void;
  onExportReports: (reportIds: string[], format: string) => void;
  onToggleFavorite: (reportId: string) => void;
  onArchiveReports: (reportIds: string[]) => void;
  isLoading?: boolean;
}

const STATUS_ICONS = {
  success: CheckCircle,
  failed: XCircle,
  processing: RefreshCw
};

const STATUS_COLORS = {
  success: 'text-green-600',
  failed: 'text-red-600',
  processing: 'text-yellow-600'
};

const QUICK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Favorites', value: 'favorites' },
  { label: 'Archived', value: 'archived' }
];

export function ReportsDataTable({ 
  reports, 
  onViewReport, 
  onDeleteReports, 
  onExportReports,
  onToggleFavorite,
  onArchiveReports,
  isLoading = false 
}: ReportsDataTableProps) {
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<any>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const columns: ColumnDef<Report>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Report Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const report = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{report.title}</p>
                  {report.is_favorited && (
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  )}
                  {report.is_archived && (
                    <Archive className="w-3 h-3 text-gray-500" />
                  )}
                </div>
                {report.content_preview && (
                  <p className="text-xs text-muted-foreground truncate">
                    {report.content_preview}
                  </p>
                )}
                {report.tags && report.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {report.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {report.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{report.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'template_type',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.getValue('template_type')}</Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as keyof typeof STATUS_ICONS;
          const StatusIcon = STATUS_ICONS[status];
          return (
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-4 h-4 ${STATUS_COLORS[status]} ${status === 'processing' ? 'animate-spin' : ''}`} />
              <span className="capitalize">{status}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue('created_at'));
          return (
            <div className="text-sm">
              <div>{format(date, 'MMM dd, yyyy')}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(date, { addSuffix: true })}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'processing_time',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Processing Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const time = row.getValue('processing_time') as number;
          return time ? (
            <div className="flex items-center gap-1 text-sm">
              <Clock className="w-3 h-3" />
              {time.toFixed(1)}s
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'file_size',
        header: 'Size',
        cell: ({ row }) => {
          const size = row.getValue('file_size') as number;
          return size ? (
            <span className="text-sm">
              {(size / 1024).toFixed(1)} KB
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const report = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewReport(report.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFavorite(report.id)}>
                  <Star className="mr-2 h-4 w-4" />
                  {report.is_favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExportReports([report.id], 'pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportReports([report.id], 'docx')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as DOCX
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchiveReports([report.id])}>
                  <Archive className="mr-2 h-4 w-4" />
                  {report.is_archived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteReports([report.id])}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onViewReport, onDeleteReports, onExportReports, onToggleFavorite, onArchiveReports]
  );

  const filteredData = useMemo(() => {
    let filtered = [...reports];

    // Apply quick filters
    if (quickFilter !== 'all') {
      const now = new Date();
      switch (quickFilter) {
        case 'today':
          filtered = filtered.filter(report => 
            format(new Date(report.created_at), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
          );
          break;
        case 'week':
          filtered = filtered.filter(report => 
            new Date(report.created_at) >= subWeeks(now, 1)
          );
          break;
        case 'month':
          filtered = filtered.filter(report => 
            new Date(report.created_at) >= subMonths(now, 1)
          );
          break;
        case 'favorites':
          filtered = filtered.filter(report => report.is_favorited);
          break;
        case 'archived':
          filtered = filtered.filter(report => report.is_archived);
          break;
      }
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Apply template filter
    if (templateFilter !== 'all') {
      filtered = filtered.filter(report => report.template_type === templateFilter);
    }

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.created_at);
        return reportDate >= dateRange.from! && reportDate <= dateRange.to!;
      });
    }

    return filtered;
  }, [reports, quickFilter, statusFilter, templateFilter, dateRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedReportIds = selectedRows.map(row => row.original.id);

  const handleBulkDelete = () => {
    if (selectedReportIds.length > 0) {
      onDeleteReports(selectedReportIds);
      setRowSelection({});
      toast({
        title: "Reports deleted",
        description: `${selectedReportIds.length} report(s) deleted successfully.`,
      });
    }
  };

  const handleBulkExport = (format: string) => {
    if (selectedReportIds.length > 0) {
      onExportReports(selectedReportIds, format);
      toast({
        title: "Export started",
        description: `Exporting ${selectedReportIds.length} report(s) as ${format.toUpperCase()}.`,
      });
    }
  };

  const handleBulkArchive = () => {
    if (selectedReportIds.length > 0) {
      onArchiveReports(selectedReportIds);
      setRowSelection({});
      toast({
        title: "Reports archived",
        description: `${selectedReportIds.length} report(s) archived successfully.`,
      });
    }
  };

  const templateTypes = [...new Set(reports.map(r => r.template_type))];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reports Management</CardTitle>
            <CardDescription>
              Manage and organize your clinical note reports
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ChevronDown className="ml-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search reports..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {templateTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap">
          {QUICK_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={quickFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedReportIds.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedReportIds.length} report(s) selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => handleBulkExport('pdf')}>
                <Download className="w-4 h-4 mr-1" />
                Export PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkExport('docx')}>
                <Download className="w-4 h-4 mr-1" />
                Export DOCX
              </Button>
              <Button size="sm" variant="outline" onClick={handleBulkArchive}>
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}