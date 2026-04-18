"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Doc } from "@convex/_generated/dataModel";
import { Edit01FreeIcons, Delete02FreeIcons } from "@hugeicons/core-free-icons";

export const getColumns = (
  onEdit: (location: Doc<"locations">) => void,
  onDelete: (location: Doc<"locations">) => void
): ColumnDef<Doc<"locations">>[] => [
  {
    accessorKey: "label",
    header: "Location Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("label")}</div>
    ),
  },
  {
    accessorKey: "_creationTime",
    header: "Created",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("_creationTime")).toLocaleDateString()}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const location = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <HugeiconsIcon icon={Edit01FreeIcons} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(location)}>
              <HugeiconsIcon icon={Edit01FreeIcons} className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(location)}
              className="text-red-600 focus:text-red-600"
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
