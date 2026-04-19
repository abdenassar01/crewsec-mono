"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { CanceledViolationsForm } from "./canceled-violations-form";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useSafeMutation, useSafeQuery } from "@/lib/hooks";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Makuleras = Doc<"canceledViolations">;

export default function MakulerasList() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingMakuleras, setEditingMakuleras] = React.useState<Makuleras | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Makuleras | null>(null);

  const makulerasList = useSafeQuery(api.canceledViolations.listForCause, { cause: "MAKULERA" });
  const createMakuleras = useSafeMutation(api.canceledViolations.create);
  const updateMakuleras = useSafeMutation(api.canceledViolations.update);
  const deleteMakuleras = useSafeMutation(api.canceledViolations.remove);

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    setIsPending(true);
    if (isEdit) {
      if (!editingMakuleras) return;
      const result = await updateMakuleras({ id: editingMakuleras._id, ...data });
      if (result !== null) {
        toast.success("Makuleras updated successfully!");
        setIsDialogOpen(false);
        setEditingMakuleras(null);
      }
    } else {
      const result = await createMakuleras(data);
      if (result !== null) {
        toast.success("New makuleras created!");
        setIsDialogOpen(false);
        setEditingMakuleras(null);
      }
    }
    setIsPending(false);
  };

  const handleDelete = (id: Doc<"canceledViolations">["_id"]) => {
    const item = makulerasList?.find((m: any) => m._id === id);
    setDeleteTarget(item ?? null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteMakuleras({ id: deleteTarget._id });
    if (result !== null) {
      toast.success("Makuleras deleted successfully!");
    }
    setDeleteTarget(null);
  };

  const columns = React.useMemo(
    () =>
      getColumns(
        (makuleras) => {
          setEditingMakuleras(makuleras);
          setIsDialogOpen(true);
        },
        handleDelete
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (makulerasList === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  if (makulerasList === null)
    return (
      <div className="space-y-4 mt-10">
        <p className="text-destructive">Failed to load makuleras. Please try again.</p>
      </div>
    );

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Makuleras Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingMakuleras(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Makuleras</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMakuleras ? "Edit Makuleras" : "Create Makuleras"}
              </DialogTitle>
            </DialogHeader>
            <CanceledViolationsForm
              onSubmit={handleFormSubmit}
              defaultValues={editingMakuleras}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={makulerasList ?? []}
        pageCount={(makulerasList?.length || 0 / 10) + 1}
        pageIndex={Math.floor((makulerasList?.length || 0) / 10) - 1}
        pageSize={100}
        setPagination={() => {}} // Not needed with loadMore
        isLoading={makulerasList === undefined}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Makuleras"
        description="Are you sure you want to delete this makuleras? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}