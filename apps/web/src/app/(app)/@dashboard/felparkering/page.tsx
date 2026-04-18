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

type Felparkering = Doc<"canceledViolations">;

export default function FelparkeringList() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingFelparkering, setEditingFelparkering] = React.useState<Felparkering | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const felparkeringar = useSafeQuery(api.canceledViolations.listForCause, { cause: "FELPARKERING" });
  const createFelparkering = useSafeMutation(api.canceledViolations.create);
  const updateFelparkering = useSafeMutation(api.canceledViolations.update);
  const deleteFelparkering = useSafeMutation(api.canceledViolations.remove);

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    setIsPending(true);
    if (isEdit) {
      if (!editingFelparkering) return;
      const result = await updateFelparkering({ id: editingFelparkering._id, ...data });
      if (result !== null) {
        toast.success("Felparkering updated successfully!");
        setIsDialogOpen(false);
        setEditingFelparkering(null);
      }
    } else {
      const result = await createFelparkering(data);
      if (result !== null) {
        toast.success("New felparkering created!");
        setIsDialogOpen(false);
        setEditingFelparkering(null);
      }
    }
    setIsPending(false);
  };

  const handleDelete = async (id: Doc<"canceledViolations">["_id"]) => {
    if (confirm("Are you sure you want to delete this felparkering?")) {
      const result = await deleteFelparkering({ id });
      if (result !== null) {
        toast.success("Felparkering deleted successfully!");
      }
    }
  };

  const columns = React.useMemo(
    () =>
      getColumns(
        (felparkering) => {
          setEditingFelparkering(felparkering);
          setIsDialogOpen(true);
        },
        handleDelete
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (felparkeringar === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  if (felparkeringar === null)
    return (
      <div className="space-y-4 mt-10">
        <p className="text-destructive">Failed to load felparkeringar. Please try again.</p>
      </div>
    );

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Felparkering Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingFelparkering(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Felparkering</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingFelparkering ? "Edit Felparkering" : "Create Felparkering"}
              </DialogTitle>
            </DialogHeader>
            <CanceledViolationsForm
              onSubmit={handleFormSubmit}
              defaultValues={editingFelparkering}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={felparkeringar ?? []}
        pageCount={(felparkeringar?.length || 0 / 10) + 1}
        pageIndex={Math.floor((felparkeringar?.length || 0) / 10) - 1}
        pageSize={100}
        setPagination={() => {}} // Not needed with loadMore
        isLoading={felparkeringar === undefined}
      />
    </div>
  );
}