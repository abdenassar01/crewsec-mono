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

type LocationViolationRow = Doc<"locationViolations"> & {
  location?: Doc<"locations"> | null;
  violation?: Doc<"violations"> | null;
};

export const getColumns = (
  onEdit: (locationViolation: LocationViolationRow) => void,
  onDelete: (locationViolation: LocationViolationRow) => void
): ColumnDef<LocationViolationRow>[] => [
  {
    accessorKey: "violation",
    header: "Violation",
    cell: ({ row }) => {
      const violation = row.original.violation;
      return <div className="font-medium">{violation?.label || "Unknown"}</div>;
    },
  },
  {
    accessorKey: "locationName",
    header: "Location",
    cell: ({ row }) => {
      const location = row.original.location;
      return <div className="font-medium">{location?.label || "Unknown"}</div>;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div>{row.getValue("price")} Kr</div>
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
      const locationViolation = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(locationViolation)}>
              <HugeiconsIcon icon={Edit01FreeIcons} className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(locationViolation)}
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
