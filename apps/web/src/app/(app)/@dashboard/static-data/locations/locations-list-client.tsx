"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useSafeQuery } from "@/lib/hooks";

interface LocationsListClientProps {
  onEdit: (location: Doc<"locations">) => void;
  onDelete: (location: Doc<"locations">) => void;
  onAdd: () => void;
}

export function LocationsListClient({ onEdit, onDelete }: LocationsListClientProps) {
  const locations = useSafeQuery(api.staticData.listLocations, { search: '' });

  return (
    <DataTable
      columns={getColumns(onEdit, onDelete)}
      data={locations ?? []}
    />
  );
}
