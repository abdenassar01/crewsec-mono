"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useSafeQuery } from "@/lib/hooks";

interface ViolationsListClientProps {
  onEdit: (violation: Doc<"violations">) => void;
  onDelete: (violation: Doc<"violations">) => void;
  onAdd: () => void;
}

export function ViolationsListClient({ onEdit, onDelete }: ViolationsListClientProps) {
  const violations = useSafeQuery(api.staticData.listViolations, { search: '' });

  return (
    <DataTable
      columns={getColumns(onEdit, onDelete)}
      data={violations ?? []}
    />
  );
}
