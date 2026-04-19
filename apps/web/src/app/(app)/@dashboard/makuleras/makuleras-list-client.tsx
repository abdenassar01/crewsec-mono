"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import { CanceledViolationsForm } from "./canceled-violations-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Doc } from "@convex/_generated/dataModel";
import { useSafeMutation, useSafeQuery } from "@/lib/hooks";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Makuleras = Doc<"canceledViolations">;

export function MakulerasListClient() {
  const makulerasList = useSafeQuery(api.canceledViolations.listForCause, { cause: "MAKULERA" });
  const createMakuleras = useSafeMutation(api.canceledViolations.create);
  const updateMakuleras = useSafeMutation(api.canceledViolations.update);
  const deleteMakuleras = useSafeMutation(api.canceledViolations.remove);

  const [editingMakuleras, setEditingMakuleras] = useState<Makuleras | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Makuleras | null>(null);

  const handleCreate = async (data: any) => {
    setIsPending(true);
    try {
      await createMakuleras(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating makuleras:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleUpdate = async (data: any, isEdit: boolean) => {
    setIsPending(true);
    try {
      if (isEdit && editingMakuleras) {
        await updateMakuleras({ id: editingMakuleras._id, ...data });
        setEditingMakuleras(null);
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Error updating makuleras:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = (id: any) => {
    const item = makulerasList?.find((m: any) => m._id === id);
    setDeleteTarget(item ?? null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMakuleras({ id: deleteTarget._id });
    } catch (error) {
      console.error("Error deleting makuleras:", error);
    }
    setDeleteTarget(null);
  };

  const handleEdit = (makuleras: Makuleras) => {
    setEditingMakuleras(makuleras);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Makuleras</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
              onSubmit={editingMakuleras ? handleUpdate : handleCreate}
              defaultValues={editingMakuleras}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={getColumns(handleEdit, handleDelete)}
        data={makulerasList || []}
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