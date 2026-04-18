"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Doc } from "@convex/_generated/dataModel";
import {
  Edit01FreeIcons,
  Delete02FreeIcons,
  ViewFreeIcons,
  RefreshFreeIcons,
  MoreHorizontalCircle01FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const statusColors: Record<string, string> = {
  AWAITING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
  CONFLICT: "bg-orange-100 text-orange-800",
};

export type ControlFeeRow = Doc<"controlFees"> & {
  townLabel?: string;
  violationLabel?: string;
  locationLabel?: string;
  price?: number;
  createdByLabel?: string;
};

export const getColumns = (
  onEdit: (fee: ControlFeeRow) => void,
  onDelete: (feeId: Doc<"controlFees">["_id"]) => void,
  onView: (fee: ControlFeeRow) => void,
  onUpdateStatus: (feeId: Doc<"controlFees">["_id"], status: string) => void
): ColumnDef<ControlFeeRow>[] => [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("reference")}</div>
    ),
  },
  {
    accessorKey: "mark",
    header: "Mark",
    cell: ({ row }) => <div>{row.getValue("mark")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge className={statusColors[status] ?? ""}>{status}</Badge>
      );
    },
  },
  {
    id: "townLabel",
    header: "Town",
    accessorKey: "townLabel",
    cell: ({ row }) => <div>{row.original.townLabel ?? "N/A"}</div>,
  },
  {
    id: "violationLabel",
    header: "Violation",
    accessorKey: "violationLabel",
    cell: ({ row }) => <div>{row.original.violationLabel ?? "N/A"}</div>,
  },
  {
    id: "price",
    header: "Price",
    cell: ({ row }) => (
      <div>{row.original.price != null ? `${row.original.price} Kr` : "N/A"}</div>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("startDate")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "createdByLabel",
    header: "Created By",
    cell: ({ row }) => <div>{row.original.createdByLabel ?? "N/A"}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const fee = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <HugeiconsIcon icon={MoreHorizontalCircle01FreeIcons} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(fee)}>
              <HugeiconsIcon icon={ViewFreeIcons} className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(fee)}>
              <HugeiconsIcon icon={Edit01FreeIcons} className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <HugeiconsIcon icon={RefreshFreeIcons} className="mr-2 h-4 w-4" />
                Update Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onUpdateStatus(fee._id, "AWAITING")}>
                  <Badge className={statusColors.AWAITING}>AWAITING</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(fee._id, "PAID")}>
                  <Badge className={statusColors.PAID}>PAID</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(fee._id, "CANCELED")}>
                  <Badge className={statusColors.CANCELED}>CANCELED</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(fee._id, "CONFLICT")}>
                  <Badge className={statusColors.CONFLICT}>CONFLICT</Badge>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(fee._id)}
              className="text-destructive"
            >
              <HugeiconsIcon icon={Delete02FreeIcons} className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
