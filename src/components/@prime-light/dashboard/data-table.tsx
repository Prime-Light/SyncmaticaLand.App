"use client";

import * as React from "react";
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type Row,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Shadcn } from "@/components";
import {
    GripVerticalIcon,
    CircleCheckIcon,
    LoaderIcon,
    EllipsisVerticalIcon,
    Columns3Icon,
    ChevronDownIcon,
    PlusIcon,
    ChevronsLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsRightIcon,
    TrendingUpIcon,
} from "lucide-react";

export const schema = z.object({
    id: z.number(),
    header: z.string(),
    type: z.string(),
    status: z.string(),
    target: z.string(),
    limit: z.string(),
    reviewer: z.string(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
    const { attributes, listeners } = useSortable({
        id,
    });

    return (
        <Shadcn.Button {...attributes} {...listeners} variant="ghost" size="icon" className="size-7 text-muted-foreground hover:bg-transparent">
            <GripVerticalIcon className="size-3 text-muted-foreground" />
            <span className="sr-only">Drag to reorder</span>
        </Shadcn.Button>
    );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Shadcn.Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Shadcn.Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "header",
        header: "Header",
        cell: ({ row }) => {
            return <TableCellViewer item={row.original} />;
        },
        enableHiding: false,
    },
    {
        accessorKey: "type",
        header: "Section Type",
        cell: ({ row }) => (
            <div className="w-32">
                <Shadcn.Badge variant="outline" className="px-1.5 text-muted-foreground">
                    {row.original.type}
                </Shadcn.Badge>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Shadcn.Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.status === "Done" ? <CircleCheckIcon className="fill-green-500 dark:fill-green-400" /> : <LoaderIcon />}
                {row.original.status}
            </Shadcn.Badge>
        ),
    },
    {
        accessorKey: "target",
        header: () => <div className="w-full text-end">Target</div>,
        cell: ({ row }) => (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
                        loading: `Saving ${row.original.header}`,
                        success: "Done",
                        error: "Error",
                    });
                }}>
                <Shadcn.Label htmlFor={`${row.original.id}-target`} className="sr-only">
                    Target
                </Shadcn.Label>
                <Shadcn.Input
                    className="h-8 w-16 border-transparent bg-transparent text-end shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
                    defaultValue={row.original.target}
                    id={`${row.original.id}-target`}
                />
            </form>
        ),
    },
    {
        accessorKey: "limit",
        header: () => <div className="w-full text-end">Limit</div>,
        cell: ({ row }) => (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
                        loading: `Saving ${row.original.header}`,
                        success: "Done",
                        error: "Error",
                    });
                }}>
                <Shadcn.Label htmlFor={`${row.original.id}-limit`} className="sr-only">
                    Limit
                </Shadcn.Label>
                <Shadcn.Input
                    className="h-8 w-16 border-transparent bg-transparent text-end shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
                    defaultValue={row.original.limit}
                    id={`${row.original.id}-limit`}
                />
            </form>
        ),
    },
    {
        accessorKey: "reviewer",
        header: "Reviewer",
        cell: ({ row }) => {
            const isAssigned = row.original.reviewer !== "Assign reviewer";

            if (isAssigned) {
                return row.original.reviewer;
            }

            return (
                <>
                    <Shadcn.Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
                        Reviewer
                    </Shadcn.Label>
                    <Shadcn.Select>
                        <Shadcn.SelectTrigger
                            className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
                            size="sm"
                            id={`${row.original.id}-reviewer`}>
                            <Shadcn.SelectValue placeholder="Assign reviewer" />
                        </Shadcn.SelectTrigger>
                        <Shadcn.SelectContent align="end">
                            <Shadcn.SelectGroup>
                                <Shadcn.SelectItem value="Eddie Lake">Eddie Lake</Shadcn.SelectItem>
                                <Shadcn.SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</Shadcn.SelectItem>
                            </Shadcn.SelectGroup>
                        </Shadcn.SelectContent>
                    </Shadcn.Select>
                </>
            );
        },
    },
    {
        id: "actions",
        cell: () => (
            <Shadcn.DropdownMenu>
                <Shadcn.DropdownMenuTrigger asChild>
                    <Shadcn.Button variant="ghost" className="flex size-8 text-muted-foreground data-[state=open]:bg-muted" size="icon">
                        <EllipsisVerticalIcon />
                        <span className="sr-only">Open menu</span>
                    </Shadcn.Button>
                </Shadcn.DropdownMenuTrigger>
                <Shadcn.DropdownMenuContent align="end" className="w-32">
                    <Shadcn.DropdownMenuItem>Edit</Shadcn.DropdownMenuItem>
                    <Shadcn.DropdownMenuItem>Make a copy</Shadcn.DropdownMenuItem>
                    <Shadcn.DropdownMenuItem>Favorite</Shadcn.DropdownMenuItem>
                    <Shadcn.DropdownMenuSeparator />
                    <Shadcn.DropdownMenuItem variant="destructive">Delete</Shadcn.DropdownMenuItem>
                </Shadcn.DropdownMenuContent>
            </Shadcn.DropdownMenu>
        ),
    },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    });

    return (
        <Shadcn.TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}>
            {row.getVisibleCells().map((cell) => (
                <Shadcn.TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Shadcn.TableCell>
            ))}
        </Shadcn.TableRow>
    );
}

export function DataTable({ data: initialData }: { data: z.infer<typeof schema>[] }) {
    const [data, setData] = React.useState(() => initialData);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const sortableId = React.useId();
    const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

    const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id);
                const newIndex = dataIds.indexOf(over.id);
                return arrayMove(data, oldIndex, newIndex);
            });
        }
    }

    return (
        <Shadcn.Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Shadcn.Label htmlFor="view-selector" className="sr-only">
                    View
                </Shadcn.Label>
                <Shadcn.Select defaultValue="outline">
                    <Shadcn.SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
                        <Shadcn.SelectValue placeholder="Select a view" />
                    </Shadcn.SelectTrigger>
                    <Shadcn.SelectContent>
                        <Shadcn.SelectGroup>
                            <Shadcn.SelectItem value="outline">Outline</Shadcn.SelectItem>
                            <Shadcn.SelectItem value="past-performance">Past Performance</Shadcn.SelectItem>
                            <Shadcn.SelectItem value="key-personnel">Key Personnel</Shadcn.SelectItem>
                            <Shadcn.SelectItem value="focus-documents">Focus Documents</Shadcn.SelectItem>
                        </Shadcn.SelectGroup>
                    </Shadcn.SelectContent>
                </Shadcn.Select>
                <Shadcn.TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
                    <Shadcn.TabsTrigger value="outline">Outline</Shadcn.TabsTrigger>
                    <Shadcn.TabsTrigger value="past-performance">
                        Past Performance <Shadcn.Badge variant="secondary">3</Shadcn.Badge>
                    </Shadcn.TabsTrigger>
                    <Shadcn.TabsTrigger value="key-personnel">
                        Key Personnel <Shadcn.Badge variant="secondary">2</Shadcn.Badge>
                    </Shadcn.TabsTrigger>
                    <Shadcn.TabsTrigger value="focus-documents">Focus Documents</Shadcn.TabsTrigger>
                </Shadcn.TabsList>
                <div className="flex items-center gap-2">
                    <Shadcn.DropdownMenu>
                        <Shadcn.DropdownMenuTrigger asChild>
                            <Shadcn.Button variant="outline" size="sm">
                                <Columns3Icon data-icon="inline-start" />
                                Columns
                                <ChevronDownIcon data-icon="inline-end" />
                            </Shadcn.Button>
                        </Shadcn.DropdownMenuTrigger>
                        <Shadcn.DropdownMenuContent align="end" className="w-32">
                            {table
                                .getAllColumns()
                                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                                .map((column) => {
                                    return (
                                        <Shadcn.DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                                            {column.id}
                                        </Shadcn.DropdownMenuCheckboxItem>
                                    );
                                })}
                        </Shadcn.DropdownMenuContent>
                    </Shadcn.DropdownMenu>
                    <Shadcn.Button variant="outline" size="sm">
                        <PlusIcon />
                        <span className="hidden lg:inline">Add Section</span>
                    </Shadcn.Button>
                </div>
            </div>
                <Shadcn.TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <div className="overflow-hidden rounded-lg border">
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}>
                        <Shadcn.Table>
                            <Shadcn.TableHeader className="sticky top-0 z-10 bg-muted">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <Shadcn.TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <Shadcn.TableHead key={header.id} colSpan={header.colSpan}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                </Shadcn.TableHead>
                                            );
                                        })}
                                    </Shadcn.TableRow>
                                ))}
                            </Shadcn.TableHeader>
                            <Shadcn.TableBody className="**:data-[slot=table-cell]:first:w-8">
                                {table.getRowModel().rows?.length ? (
                                    <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                                        {table.getRowModel().rows.map((row) => (
                                            <DraggableRow key={row.id} row={row} />
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <Shadcn.TableRow>
                                        <Shadcn.TableCell colSpan={columns.length} className="h-24 text-center">
                                            No results.
                                        </Shadcn.TableCell>
                                    </Shadcn.TableRow>
                                )}
                            </Shadcn.TableBody>
                        </Shadcn.Table>
                    </DndContext>
                </div>
                <div className="flex items-center justify-between px-4">
                            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Shadcn.Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Rows per page
                            </Shadcn.Label>
                            <Shadcn.Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                }}>
                                <Shadcn.SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                    <Shadcn.SelectValue placeholder={table.getState().pagination.pageSize} />
                                </Shadcn.SelectTrigger>
                                <Shadcn.SelectContent side="top">
                                    <Shadcn.SelectGroup>
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <Shadcn.SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </Shadcn.SelectItem>
                                        ))}
                                    </Shadcn.SelectGroup>
                                </Shadcn.SelectContent>
                            </Shadcn.Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </div>
                            <div className="ms-auto flex items-center gap-2 lg:ms-0">
                            <Shadcn.Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}>
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeftIcon />
                            </Shadcn.Button>
                            <Shadcn.Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}>
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeftIcon />
                            </Shadcn.Button>
                            <Shadcn.Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}>
                                <span className="sr-only">Go to next page</span>
                                <ChevronRightIcon />
                            </Shadcn.Button>
                            <Shadcn.Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}>
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRightIcon />
                            </Shadcn.Button>
                        </div>
                    </div>
                </div>
            </Shadcn.TabsContent>
            <Shadcn.TabsContent value="past-performance" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </Shadcn.TabsContent>
            <Shadcn.TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </Shadcn.TabsContent>
            <Shadcn.TabsContent value="focus-documents" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </Shadcn.TabsContent>
        </Shadcn.Tabs>
    );
}

const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--primary)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--primary)",
    },
} satisfies Shadcn.ChartConfig;

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
    const isMobile = useIsMobile();

    return (
        <Shadcn.Drawer direction={isMobile ? "bottom" : "right"}>
            <Shadcn.DrawerTrigger asChild>
                <Shadcn.Button variant="link" className="w-fit px-0 text-start text-foreground">
                    {item.header}
                </Shadcn.Button>
            </Shadcn.DrawerTrigger>
            <Shadcn.DrawerContent>
                <Shadcn.DrawerHeader className="gap-1">
                    <Shadcn.DrawerTitle>{item.header}</Shadcn.DrawerTitle>
                    <Shadcn.DrawerDescription>Showing total visitors for the last 6 months</Shadcn.DrawerDescription>
                </Shadcn.DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {!isMobile && (
                        <>
                            <Shadcn.ChartContainer config={chartConfig}>
                                <AreaChart
                                    accessibilityLayer
                                    data={chartData}
                                    margin={{
                                        left: 0,
                                        right: 10,
                                    }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                        hide
                                    />
                                    <Shadcn.ChartTooltip cursor={false} content={<Shadcn.ChartTooltipContent indicator="dot" />} />
                                    <Area
                                        dataKey="mobile"
                                        type="natural"
                                        fill="var(--color-mobile)"
                                        fillOpacity={0.6}
                                        stroke="var(--color-mobile)"
                                        stackId="a"
                                    />
                                    <Area
                                        dataKey="desktop"
                                        type="natural"
                                        fill="var(--color-desktop)"
                                        fillOpacity={0.4}
                                        stroke="var(--color-desktop)"
                                        stackId="a"
                                    />
                                </AreaChart>
                            </Shadcn.ChartContainer>
                            <Shadcn.Separator />
                            <div className="grid gap-2">
                                <div className="flex gap-2 leading-none font-medium">
                                    Trending up by 5.2% this month <TrendingUpIcon className="size-4" />
                                </div>
                                <div className="text-muted-foreground">
                                    Showing total visitors for the last 6 months. This is just some random text to test the layout. It spans
                                    multiple lines and should wrap around.
                                </div>
                            </div>
                            <Shadcn.Separator />
                        </>
                    )}
                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Shadcn.Label htmlFor="header">Header</Shadcn.Label>
                            <Shadcn.Input id="header" defaultValue={item.header} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3">
                                <Shadcn.Label htmlFor="type">Type</Shadcn.Label>
                                <Shadcn.Select defaultValue={item.type}>
                                    <Shadcn.SelectTrigger id="type" className="w-full">
                                        <Shadcn.SelectValue placeholder="Select a type" />
                                    </Shadcn.SelectTrigger>
                                    <Shadcn.SelectContent>
                                        <Shadcn.SelectGroup>
                                            <Shadcn.SelectItem value="Table of Contents">Table of Contents</Shadcn.SelectItem>
                                            <Shadcn.SelectItem value="Executive Summary">Executive Summary</Shadcn.SelectItem>
                                            <Shadcn.SelectItem value="Technical Approach">Technical Approach</Shadcn.SelectItem>
                                            <Shadcn.SelectItem value="Design">Design</Shadcn.SelectItem>
                                            <Shadcn.SelectItem value="Capabilities">Capabilities</Shadcn.SelectItem>
                                            <Shadcn.SelectItem value="Focus Documents">Focus Documents</Shadcn.SelectItem>
                                            <Shadcn.SelectItem value="Narrative">Narrative</Shadcn.SelectItem>
                                            <Shadcn.SelectItem value="Cover Page">Cover Page</Shadcn.SelectItem>
                                        </Shadcn.SelectGroup>
                                    </Shadcn.SelectContent>
                                </Shadcn.Select>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Shadcn.Label htmlFor="status">Status</Shadcn.Label>
                                <Shadcn.Select defaultValue={item.status}>
                                    <Shadcn.SelectTrigger id="status" className="w-full">
                                        <Shadcn.SelectValue placeholder="Select a status" />
                                    </Shadcn.SelectTrigger>
                                    <Shadcn.SelectContent>
                                        <Shadcn.SelectGroup>
                                            <Shadcn.SelectItem value="Done">Done</Shadcn.SelectItem>
                                            <Shadcn.SelectItem value="In Progress">In Progress</Shadcn.SelectItem>
                                            <Shadcn.SelectItem value="Not Started">Not Started</Shadcn.SelectItem>
                                        </Shadcn.SelectGroup>
                                    </Shadcn.SelectContent>
                                </Shadcn.Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3">
                                <Shadcn.Label htmlFor="target">Target</Shadcn.Label>
                                <Shadcn.Input id="target" defaultValue={item.target} />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Shadcn.Label htmlFor="limit">Limit</Shadcn.Label>
                                <Shadcn.Input id="limit" defaultValue={item.limit} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Shadcn.Label htmlFor="reviewer">Reviewer</Shadcn.Label>
                            <Shadcn.Select defaultValue={item.reviewer}>
                                <Shadcn.SelectTrigger id="reviewer" className="w-full">
                                    <Shadcn.SelectValue placeholder="Select a reviewer" />
                                </Shadcn.SelectTrigger>
                                <Shadcn.SelectContent>
                                    <Shadcn.SelectGroup>
                                        <Shadcn.SelectItem value="Eddie Lake">Eddie Lake</Shadcn.SelectItem>
                                        <Shadcn.SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</Shadcn.SelectItem>
                                        <Shadcn.SelectItem value="Emily Whalen">Emily Whalen</Shadcn.SelectItem>
                                    </Shadcn.SelectGroup>
                                </Shadcn.SelectContent>
                            </Shadcn.Select>
                        </div>
                    </form>
                </div>
                <Shadcn.DrawerFooter>
                    <Shadcn.Button>Submit</Shadcn.Button>
                    <Shadcn.DrawerClose asChild>
                        <Shadcn.Button variant="outline">Done</Shadcn.Button>
                    </Shadcn.DrawerClose>
                </Shadcn.DrawerFooter>
            </Shadcn.DrawerContent>
        </Shadcn.Drawer>
    );
}
