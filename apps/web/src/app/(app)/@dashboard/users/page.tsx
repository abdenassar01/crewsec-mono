"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserForm } from "./user-form";
import { UserFilters, type UserFilters as UserFiltersType } from "./user-filters";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useSafeMutation, useSafePaginatedQuery } from "@/lib/hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function UserListClient() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<Doc<"users"> | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = React.useState<Doc<"users"> | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Doc<"users"> | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [filters, setFilters] = React.useState<UserFiltersType>({
    searchTerm: "",
    role: "",
    enabled: null,
  });

  const { isLoading, loadMore, results, status } = useSafePaginatedQuery(
    api.users.list,
    { paginationOpts: { numItems: 100, cursor: null } },
    { initialNumItems: 100 }
  );

  const updateUser = useSafeMutation(api.users.update);
  const createUser = useSafeMutation(api.users.create);
  const deleteUser = useSafeMutation(api.users.deleteUser);
  const resetUserPassword = useSafeMutation(api.users.resetUserPassword);

  const handleDelete = (userId: Doc<"users">["_id"]) => {
    const user = results.find((u: any) => u._id === userId);
    setDeleteTarget(user ?? null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteUser({ userId: deleteTarget._id });
    if (result !== null) {
      toast.success("User deleted.");
    }
    setDeleteTarget(null);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const result = await resetUserPassword({
      userId: resetPasswordUser._id,
      newPassword,
    });

    if (result !== null) {
      toast.success("Password reset successfully!");
      setResetPasswordUser(null);
      setNewPassword("");
    }
  };

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      role: "",
      enabled: null,
    });
  };

  // Filter results based on filters
  const filteredResults = React.useMemo(() => {
    return results.filter((user: any) => {
      // Exclude clients - only show admins and employees
      if (user.role === 'CLIENT') {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          user.name?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Role filter
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      // Enabled filter
      if (filters.enabled !== null && user.enabled !== filters.enabled) {
        return false;
      }

      return true;
    });
  }, [results, filters]);

  const filtersComponent = (
    <UserFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onReset={handleResetFilters}
    />
  );

  const columns = React.useMemo(
    () =>
      getColumns(
        (user) => {
          setEditingUser(user);
          setIsDialogOpen(true);
        },
        handleDelete,
        (user) => {
          setResetPasswordUser(user);
          setNewPassword("");
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    if (isEdit) {
      if (!editingUser) return;
      const result = await updateUser({
        userId: editingUser._id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        enabled: data.enabled,
      });
      if (result !== null) {
        toast.success("User updated successfully!");
        setIsDialogOpen(false);
        setEditingUser(null);
      }
    } else {
      const result = await createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      });
      if (result !== null) {
        toast.success("New user created!");
        setIsDialogOpen(false);
        setEditingUser(null);
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

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingUser(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80svh] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
            </DialogHeader>
            <UserForm
              onSubmit={handleFormSubmit}
              defaultValues={editingUser ?? undefined}
              isPending={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={filteredResults}
        pageCount={(filteredResults.length / 10) + 1}
        pageIndex={Math.floor(filteredResults.length / 10) - 1}
        pageSize={100}
        setPagination={() => {}}
        loadMore={status === "CanLoadMore" ? () => loadMore?.(2) : undefined}
        isLoading={isLoading}
        filters={filtersComponent}
      />

      <Dialog open={!!resetPasswordUser} onOpenChange={(open) => !open && setResetPasswordUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {resetPasswordUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <Button onClick={handleResetPassword} disabled={!newPassword || newPassword.length < 8}>
              Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? "this user"}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}