"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSafeMutation, useSafeQuery } from "@/lib/hooks";
import { ControlFeeForm } from "./control-fee-form";
import { getColumns, type ControlFeeRow } from "./columns";
import { ControlFeeDetailDialog } from "./control-fee-detail-dialog";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { AddSquareFreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type FilterState = {
  townId: Id<"towns"> | undefined;
  violationId: Id<"violations"> | undefined;
};

export default function ControlFeeList() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingControlFee, setEditingControlFee] = React.useState<Doc<"controlFees"> | null>(null);
  const [viewFeeId, setViewFeeId] = React.useState<Doc<"controlFees">["_id"] | null>(null);
  const [filters, setFilters] = React.useState<FilterState>({
    townId: undefined,
    violationId: undefined,
  });

  const towns = useSafeQuery(api.staticData.listTowns, { search: "" });
  const violations = useSafeQuery(api.staticData.listViolations, { search: "" });
  const locationViolations = useSafeQuery(api.staticData.listLocationViolations, {});
  const users = useSafeQuery(api.users.getUsersByRole, { role: "EMPLOYEE" as const });
  const adminUsers = useSafeQuery(api.users.getUsersByRole, { role: "ADMIN" as const });

  const controlFeesResult = useSafeQuery(api.controlFees.list, {
    paginationOpts: { numItems: 100, cursor: null },
    townId: filters.townId,
    violationId: filters.violationId,
  });

  const controlFees = controlFeesResult?.page ?? [];
  const isLoading = controlFeesResult === undefined;

  const createControlFee = useSafeMutation(api.controlFees.create);
  const updateControlFee = useSafeMutation(api.controlFees.update);
  const updateStatus = useSafeMutation(api.controlFees.updateStatus);
  const deleteControlFee = useSafeMutation(api.controlFees.deleteFee);

  const allUsers = React.useMemo(() => {
    const admins = Array.isArray(adminUsers) ? adminUsers : [];
    const employees = Array.isArray(users) ? users : [];
    const map = new Map<string, string>();
    [...admins, ...employees].forEach((u: any) => map.set(u._id, u.name));
    return map;
  }, [users, adminUsers]);

  const lvMap = React.useMemo(() => {
    if (!locationViolations || !Array.isArray(violations)) return new Map();
    const map = new Map<string, { violationId: string; locationId: string; price: number }>();
    (locationViolations as any[]).forEach((lv: any) => {
      map.set(lv._id, { violationId: lv.violationId, locationId: lv.locationId, price: lv.price });
    });
    return map;
  }, [locationViolations, violations]);

  const townMap = React.useMemo(() => {
    if (!towns || !Array.isArray(towns)) return new Map<string, string>();
    const map = new Map<string, string>();
    (towns as any[]).forEach((t: any) => map.set(t._id, t.label));
    return map;
  }, [towns]);

  const violationMap = React.useMemo(() => {
    if (!violations || !Array.isArray(violations)) return new Map<string, string>();
    const map = new Map<string, string>();
    (violations as any[]).forEach((v: any) => map.set(v._id, v.label));
    return map;
  }, [violations]);

  const enrichedFees: ControlFeeRow[] = React.useMemo(() => {
    return controlFees.map((fee: any) => {
      const lv = lvMap.get(fee.locationViolationId);
      return {
        ...fee,
        townLabel: townMap.get(fee.townId),
        violationLabel: lv ? violationMap.get(lv.violationId) : undefined,
        price: lv?.price,
        createdByLabel: fee.createdBy ? allUsers.get(fee.createdBy) : undefined,
      };
    });
  }, [controlFees, lvMap, townMap, violationMap, allUsers]);

  const handleDelete = async (feeId: Doc<"controlFees">["_id"]) => {
    const result = await deleteControlFee({ id: feeId });
    if (result !== null) {
      toast.success("Control fee deleted.");
    }
  };

  const handleUpdateStatus = async (feeId: Doc<"controlFees">["_id"], status: string) => {
    const result = await updateStatus({ id: feeId, status: status as any });
    if (result !== null) {
      toast.success(`Status updated to ${status}`);
    }
  };

  const handleView = (fee: ControlFeeRow) => {
    setViewFeeId(fee._id);
  };

  const handleTownChange = (value: string) => {
    const townId = value === "all" ? undefined : (value as Id<"towns">);
    setFilters((prev) => ({ ...prev, townId }));
  };

  const handleViolationChange = (value: string) => {
    const violationId = value === "all" ? undefined : (value as Id<"violations">);
    setFilters((prev) => ({ ...prev, violationId }));
  };

  const handleResetFilters = () => {
    setFilters({ townId: undefined, violationId: undefined });
  };

  const columns = React.useMemo(
    () => getColumns(
      (fee) => {
        setEditingControlFee(fee);
        setIsFormOpen(true);
      },
      handleDelete,
      handleView,
      handleUpdateStatus
    ),
    []
  );

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    if (isEdit) {
      if (!editingControlFee) return;
      const result = await updateControlFee({ id: editingControlFee._id, ...data });
      if (result !== null) {
        toast.success("Control fee updated successfully!");
        setIsFormOpen(false);
        setEditingControlFee(null);
      }
    } else {
      const result = await createControlFee(data);
      if (result !== null) {
        toast.success("New control fee created!");
        setIsFormOpen(false);
        setEditingControlFee(null);
      }
    }
  };

  return (
    <div className="space-y-6 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Control Fee Management</h1>
        <Button onClick={() => { setEditingControlFee(null); setIsFormOpen(true); }}>
          <HugeiconsIcon icon={AddSquareFreeIcons} className="mr-2 h-4 w-4" />
          Add New Control Fee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Town</Label>
              <Select value={filters.townId || "all"} onValueChange={handleTownChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select town" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Towns</SelectItem>
                  {Array.isArray(towns) && towns.map((town: any) => (
                    <SelectItem key={town._id} value={town._id}>
                      {town.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Violation</Label>
              <Select value={filters.violationId || "all"} onValueChange={handleViolationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select violation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Violations</SelectItem>
                  {Array.isArray(violations) && violations.map((violation: any) => (
                    <SelectItem key={violation._id} value={violation._id}>
                      {violation.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={enrichedFees} />
      )}

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingControlFee(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingControlFee ? "Edit Control Fee" : "Create New Control Fee"}
            </DialogTitle>
            <DialogDescription>
              {editingControlFee ? "Update the control fee details below." : "Fill in the details for the new control fee."}
            </DialogDescription>
          </DialogHeader>
          <ControlFeeForm
            onSubmit={handleFormSubmit}
            defaultValues={editingControlFee ?? undefined}
            isPending={false}
          />
        </DialogContent>
      </Dialog>

      <ControlFeeDetailDialog
        controlFeeId={viewFeeId}
        open={!!viewFeeId}
        onOpenChange={(open) => { if (!open) setViewFeeId(null); }}
      />
    </div>
  );
}
