"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalFreeIcons, ViewFreeIcons, Delete02FreeIcons, Edit02FreeIcons } from "@hugeicons/core-free-icons";
import type { Doc } from "@convex/_generated/dataModel";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  TRIAL: "bg-yellow-100 text-yellow-800",
  INACTIVE: "bg-red-100 text-red-800",
};

export const getColumns = (
  onEdit: (org: Doc<"organizations">) => void,
  onViewStats: (org: Doc<"organizations">) => void,
  onDelete: (orgId: Doc<"organizations">["_id"]) => void
): ColumnDef<Doc<"organizations">>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => row.original.address ?? "—",
  },
  {
    accessorKey: "subscriptionStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.subscriptionStatus ?? "TRIAL";
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] ?? "bg-gray-100 text-gray-800"}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      if (!createdAt) return "—";
      return new Date(createdAt).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const org = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <HugeiconsIcon icon={MoreHorizontalFreeIcons} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(org._id)}>
              Copy Organization ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(org)}>
              <HugeiconsIcon icon={Edit02FreeIcons} className="mr-2 h-4 w-4" />
              Edit Organization
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewStats(org)}>
              <HugeiconsIcon icon={ViewFreeIcons} className="mr-2 h-4 w-4" />
              View Stats
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => onDelete(org._id)}
            >
              <HugeiconsIcon icon={Delete02FreeIcons} className="mr-2 h-4 w-4" />
              Delete Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
