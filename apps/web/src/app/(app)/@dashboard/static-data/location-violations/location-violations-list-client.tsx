"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useMemo } from "react";
import { useSafeQuery } from "@/lib/hooks";

type LocationViolationRow = Doc<"locationViolations"> & {
  location?: Doc<"locations"> | null;
  violation?: Doc<"violations"> | null;
};

interface LocationViolationsListClientProps {
  onEdit: (locationViolation: LocationViolationRow) => void;
  onDelete: (locationViolation: LocationViolationRow) => void;
  onAdd: () => void;
}

export function LocationViolationsListClient({ onEdit, onDelete }: LocationViolationsListClientProps) {
  const locations = useSafeQuery(api.staticData.listLocations, { search: '' });
  const violations = useSafeQuery(api.staticData.listViolations, { search: '' });
  const locationViolations = useSafeQuery(api.staticData.listLocationViolations, {});

  const enrichedData = useMemo(() => {
    if (!locationViolations || !locations || !violations) return [];

    return locationViolations.map((lv: any) => {
      const location = locations.find((l: any) => l._id === lv.locationId) || null;
      const violation = violations.find((v: any) => v._id === lv.violationId) || null;
      return {
        ...lv,
        location,
        violation,
      };
    });
  }, [locationViolations, locations, violations]);

  return (
    <DataTable
      columns={getColumns(onEdit, onDelete)}
      data={enrichedData}
    />
  );
}
