"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationForm } from "./organization-form";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useSafeMutation, useSafeQuery } from "@/lib/hooks";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function OrganizationListPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingOrg, setEditingOrg] = React.useState<Doc<"organizations"> | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Doc<"organizations"> | null>(null);
  const [statsTarget, setStatsTarget] = React.useState<Doc<"organizations"> | null>(null);

  const currentUser = useSafeQuery(api.users.getCurrentUserProfile);
  const isSuperAdmin = (currentUser as any)?.role === "SUPER_ADMIN";

  const organizations = useSafeQuery(api.organizations.list);
  const isLoading = organizations === undefined;
  const stats = useSafeQuery(
    api.organizations.getOrgStats,
    statsTarget ? { id: statsTarget._id } : ("skip" as any)
  );

  const createOrg = useSafeMutation(api.organizations.create);
  const updateOrg = useSafeMutation(api.organizations.update);
  const deleteOrg = useSafeMutation(api.organizations.remove);
  const getUploadUrl = useSafeMutation(api.organizations.getUploadUrl);

  const handleDelete = (orgId: Doc<"organizations">["_id"]) => {
    if (!isSuperAdmin) return;
    const org = (organizations as any[])?.find((o: any) => o._id === orgId);
    setDeleteTarget(org ?? null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteOrg({ id: deleteTarget._id });
    if (result !== null) {
      toast.success("Organization deleted.");
    }
    setDeleteTarget(null);
  };

  const columns = React.useMemo(
    () =>
      getColumns(
        (org) => {
          setEditingOrg(org);
          setIsDialogOpen(true);
        },
        (org) => {
          setStatsTarget(org);
        },
        isSuperAdmin ? handleDelete : () => {},
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSuperAdmin]
  );

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    let logoStorageId: Id<'_storage'> | null = null;

    if (data.logoImage && data.logoImage instanceof File) {
      const uploadUrl = await getUploadUrl();
      if (!uploadUrl) {
        toast.error("Failed to get upload URL");
        return;
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': data.logoImage.type },
        body: data.logoImage,
      });

      if (response.ok) {
        const { storageId } = await response.json();
        logoStorageId = storageId;
      } else {
        toast.error('Failed to upload logo');
        return;
      }
    }

    if (isEdit) {
      if (!editingOrg) return;
      const result = await updateOrg({
        id: editingOrg._id,
        name: data.name,
        description: data.description,
        email: data.email,
        phone: data.phone,
        address: data.address,
        website: data.website,
        subscriptionStatus: isSuperAdmin ? data.subscriptionStatus : undefined,
        logoStorageId: logoStorageId || editingOrg.logoStorageId,
      });
      if (result !== null) {
        toast.success("Organization updated successfully!");
        setIsDialogOpen(false);
        setEditingOrg(null);
      }
    } else {
      if (!isSuperAdmin) return;
      const result = await createOrg({
        name: data.name,
        description: data.description,
        email: data.email,
        phone: data.phone,
        address: data.address,
        website: data.website,
        subscriptionStatus: data.subscriptionStatus,
      });
      if (result !== null) {
        toast.success("New organization created!");
        setIsDialogOpen(false);
        setEditingOrg(null);
      }
    }
  };

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  const orgs = (organizations as any[]) ?? [];

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Organization Management</h1>
        {isSuperAdmin && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingOrg(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>Add New Organization</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80svh] overflow-y-scroll">
              <DialogHeader>
                <DialogTitle>{editingOrg ? "Edit Organization" : "Create New Organization"}</DialogTitle>
              </DialogHeader>
              <OrganizationForm
                onSubmit={handleFormSubmit}
                defaultValues={editingOrg ?? undefined}
                isPending={false}
                isSuperAdmin={isSuperAdmin}
              />
            </DialogContent>
          </Dialog>
        )}
        {!isSuperAdmin && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingOrg(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>Edit Organization</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80svh] overflow-y-scroll">
              <DialogHeader>
                <DialogTitle>Edit Organization</DialogTitle>
              </DialogHeader>
              <OrganizationForm
                onSubmit={handleFormSubmit}
                defaultValues={editingOrg ?? orgs[0] ?? undefined}
                isPending={false}
                isSuperAdmin={false}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable
        columns={columns}
        data={orgs}
        pageCount={(orgs.length / 10) + 1}
        pageIndex={Math.floor(orgs.length / 10) - 1}
        pageSize={100}
        setPagination={() => {}}
        isLoading={isLoading}
      />

      <Dialog open={!!statsTarget} onOpenChange={(open) => !open && setStatsTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stats for {statsTarget?.name ?? "Organization"}</DialogTitle>
          </DialogHeader>
          {stats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-2xl font-bold">{stats.userCount}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Parkings</p>
                <p className="text-2xl font-bold">{stats.parkingCount}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Vehicles</p>
                <p className="text-2xl font-bold">{stats.vehicleCount}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Control Fees</p>
                <p className="text-2xl font-bold">{stats.controlFeeCount}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Violations</p>
                <p className="text-2xl font-bold">{stats.violationCount}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading stats...</p>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Organization"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? "this organization"}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
