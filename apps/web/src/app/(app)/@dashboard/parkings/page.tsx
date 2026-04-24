"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingForm } from "./parking-form";
import { ParkingFilters, type ParkingFilters as ParkingFiltersType } from "./parking-filters";
import { getColumns, type ParkingWithUser } from "./columns";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useSafeMutation, useSafeQuery } from "@/lib/hooks";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ParkingList() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingParking, setEditingParking] = React.useState<ParkingWithUser | null>(null);
  const [resetPasswordParking, setResetPasswordParking] = React.useState<ParkingWithUser | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [anonymizeTarget, setAnonymizeTarget] = React.useState<ParkingWithUser | null>(null);
  const [filters, setFilters] = React.useState<ParkingFiltersType>({
    searchTerm: "",
    location: "",
    startDate: undefined,
    endDate: undefined,
    availableOnly: false,
    unresolvedIssues: false,
    enabledOnly: false,
  });

  const parkings = useSafeQuery(api.parkings.list, { query: '' });

  const createUserAndParking = useSafeMutation(api.parkings.createUserAndParking);
  const updateParkingAndUser = useSafeMutation(api.parkings.updateParkingAndUser);
  const anonymizeParking = useSafeMutation(api.parkings.anonymizeParking);
  const getUploadUrl = useSafeMutation(api.parkings.getUploadUrl);
  const resetUserPassword = useSafeMutation(api.users.resetUserPassword);

  const handleFiltersChange = (newFilters: ParkingFiltersType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
      availableOnly: false,
      unresolvedIssues: false,
      enabledOnly: false,
    });
  };

  // Filter results based on filters
  const filteredResults = React.useMemo(() => {
    if (!parkings) return [];
    return parkings.filter((parking) => {
      // Hide anonymized parkings
      if (parking.name?.startsWith('[Anonymized')) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          parking.name.toLowerCase().includes(searchLower) ||
          parking.address.toLowerCase().includes(searchLower) ||
          parking.description.toLowerCase().includes(searchLower) ||
          parking.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        if (!parking.location.toLowerCase().includes(locationLower)) {
          return false;
        }
      }

      // Available only filter
      if (filters.availableOnly) {
        const hasUnresolvedIssues =
          ((parking.unresolvedMarkuleras || 0) > 0) ||
          ((parking.unresolvedFelparkering || 0) > 0);
        if (hasUnresolvedIssues) return false;
      }

      // Unresolved issues filter
      if (filters.unresolvedIssues) {
        const hasUnresolvedIssues =
          ((parking.unresolvedMarkuleras || 0) > 0) ||
          ((parking.unresolvedFelparkering || 0) > 0);
        if (!hasUnresolvedIssues) return false;
      }

      // Date range filter
      if (filters.startDate || filters.endDate) {
        const startDate = filters.startDate ? new Date(filters.startDate).getTime() : 0;
        const endDate = filters.endDate ? new Date(filters.endDate).getTime() : Date.now();

        // Check if parking has availability in the specified date range
        // This is a simplified check - in a real implementation you'd query the availability
        // For now, we'll assume all parkings are available if they have no unresolved issues
        if (filters.availableOnly) {
          const hasUnresolvedIssues =
            ((parking?.unresolvedMarkuleras || 0) > 0) ||
            ((parking?.unresolvedFelparkering || 0) > 0);
          if (hasUnresolvedIssues) return false;
        }
      }

      return true;
    }) || [];
  }, [parkings, filters]);

  const filtersComponent = (
    <ParkingFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onReset={handleResetFilters}
    />
  );

  const handleResetPassword = async () => {
    if (!resetPasswordParking || !newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!resetPasswordParking.user) {
      toast.error("No user associated with this parking");
      return;
    }
    const result = await resetUserPassword({
      userId: resetPasswordParking.user._id,
      newPassword,
    });
    if (result !== null) {
      toast.success("Password reset successfully!");
      setResetPasswordParking(null);
      setNewPassword("");
    }
  };

  const columns = React.useMemo(
    () => getColumns(
        (parking) => {
          setEditingParking(parking);
          setIsDialogOpen(true);
        },
        async (parkingId) => {
          const parking = filteredResults.find((p) => p._id === parkingId);
          setAnonymizeTarget(parking ?? null);
        },
        (parking) => {
          setResetPasswordParking(parking);
          setNewPassword("");
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const confirmAnonymize = async () => {
    if (!anonymizeTarget) return;
    const result = await anonymizeParking({ id: anonymizeTarget._id });
    if (result !== null) {
      toast.success("Parking anonymized.");
    }
    setAnonymizeTarget(null);
  };

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    setIsPending(true);
    try {
      let imageStorageId: Id<'_storage'> | null = null;

      // Handle image upload if present
      if (data.parkingImage && data.parkingImage instanceof File) {
        // Get upload URL
        const uploadUrl = await getUploadUrl();

        if (!uploadUrl) {
          toast.error("Failed to get upload URL");
          return;
        }

        // Upload file directly to the upload URL
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': data.parkingImage.type },
          body: data.parkingImage,
        });

        if (response.ok) {
          const { storageId } = await response.json();
          imageStorageId = storageId;
        } else {
          toast.error('Failed to upload image');
          return;
        }
      }

      if (isEdit) {
        if (!editingParking) return;
        const result = await updateParkingAndUser({
          parkingId: editingParking._id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: data.role,
          parkingName: data.parkingName,
          description: data.parkingDescription,
          location: data.parkingLocation,
          website: data.parkingWebsite,
          address: data.parkingAddress,
          imageStorageId: imageStorageId || editingParking.imageStorageId,
          maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity, 10) : undefined,
        });
        if (result !== null) {
          toast.success("Parking and user updated successfully!");
          setIsDialogOpen(false);
          setEditingParking(null);
        }
      } else {
        const result = await createUserAndParking({
          email: data.email,
          password: data.password,
          role: data.role,
          parkingName: data.parkingName,
          parkingDescription: data.parkingDescription,
          parkingLocation: data.parkingLocation,
          parkingWebsite: data.parkingWebsite,
          parkingAddress: data.parkingAddress,
          imageStorageId: imageStorageId as Id<'_storage'>,
          name: data.name,
          maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity, 10) : undefined,
        });

        if (result !== null) {
          toast.success("New user and parking created!");
          setIsDialogOpen(false);
          setEditingParking(null);
        }
      }
    } finally {
      setIsPending(false);
    }
  };

  if (parkings === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  if (parkings === null)
    return (
      <div className="space-y-4 mt-10">
        <p className="text-destructive">Failed to load parkings. Please try again.</p>
      </div>
    );

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Parking Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingParking(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Parking</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80svh] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>{editingParking ? "Edit Parking" : "Create New Parking & User"}</DialogTitle>
            </DialogHeader>
            <ParkingForm
              onSubmit={handleFormSubmit}
              defaultValues={editingParking ?? undefined}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={filteredResults}
        pageCount={(filteredResults?.length / 10) + 1}
        pageIndex={Math.floor(filteredResults.length / 10) - 1}
        pageSize={100}
        setPagination={() => {}}
        isLoading={parkings === undefined}
        filters={filtersComponent}
      />

      <Dialog open={!!resetPasswordParking} onOpenChange={(open) => !open && setResetPasswordParking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {resetPasswordParking?.user?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="parking-new-password">New Password</Label>
              <Input
                id="parking-new-password"
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
        open={!!anonymizeTarget}
        onOpenChange={(open) => !open && setAnonymizeTarget(null)}
        title="Anonymize & Close Parking"
        description={`Are you sure you want to anonymize and close "${anonymizeTarget?.name ?? "this parking"}"? This action cannot be undone.`}
        confirmLabel="Anonymize"
        onConfirm={confirmAnonymize}
      />
    </div>
  );
}