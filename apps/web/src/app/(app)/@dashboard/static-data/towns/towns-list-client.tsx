"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useSafeQuery } from "@/lib/hooks";

interface TownsListClientProps {
  onEdit: (town: Doc<"towns">) => void;
  onDelete: (town: Doc<"towns">) => void;
  onAdd: () => void;
}

export function TownsListClient({ onEdit, onDelete }: TownsListClientProps) {
  const towns = useSafeQuery(api.staticData.listTowns, { search: '' });

  return (
    <DataTable
      columns={getColumns(onEdit, onDelete)}
      data={towns ?? []}
    />
  );
}
