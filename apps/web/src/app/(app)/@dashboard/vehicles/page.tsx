"use client";

import * as React from "react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleForm } from "./vehicle-form";
import { VehicleFilters, type VehicleFilters as VehicleFiltersType } from "./vehicle-filters";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Pagination } from "@/components/ui/pagination";
import { useSafeMutation, useSafeQuery } from "@/lib/hooks";

const ITEMS_PER_PAGE = 20;

export default function VehicleList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Doc<"vehicles"> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<VehicleFiltersType>({
    searchTerm: "",
    parkingId: undefined,
    startDate: undefined,
    leaveDate: undefined,
  });

  const vehiclesResult = useSafeQuery(api.vehicles.list);
  const vehicles = vehiclesResult?.page ?? [];
  const isLoading = vehiclesResult === undefined;

  // Reset pagination when filters change
  const handleFiltersChange = (newFilters: VehicleFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      parkingId: undefined,
      startDate: undefined,
      leaveDate: undefined,
    });
    setCurrentPage(1);
  };

  // Simple client-side pagination
  const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE) || 1;

  const createVehicle = useSafeMutation(api.vehicles.create);
  const updateVehicle = useSafeMutation(api.vehicles.update);
  const deleteVehicle = useSafeMutation(api.vehicles.deleteVehicle);

  // Client-side pagination: get vehicles for current page
  const paginatedVehicles = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return vehicles.slice(startIndex, endIndex);
  }, [vehicles, currentPage]);

  const handleDelete = async (vehicleId: Doc<"vehicles">["_id"]) => {
    const result = await deleteVehicle({ id: vehicleId });
    if (result !== null) {
      toast.success("Vehicle deleted.");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns = React.useMemo(
    () =>
      getColumns(
        (vehicle) => {
          setEditingVehicle(vehicle);
          setIsDialogOpen(true);
        },
        handleDelete
      ),
    []
  );

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    if (isEdit) {
      if (!editingVehicle) return;
      const result = await updateVehicle({
        id: editingVehicle._id,
        ...data,
      });
      if (result !== null) {
        toast.success("Vehicle updated successfully!");
        setIsDialogOpen(false);
        setEditingVehicle(null);
      }
    } else {
      const result = await createVehicle({
        ...data,
      });
      if (result !== null) {
        toast.success("New vehicle created!");
        setIsDialogOpen(false);
        setEditingVehicle(null);
      }
    }
  };

  if (isLoading && vehicles.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const filtersComponent = (
    <VehicleFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onReset={handleResetFilters}
    />
  );

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicle Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingVehicle(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Vehicle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80svh] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Create New Vehicle"}</DialogTitle>
            </DialogHeader>
            <VehicleForm
              onSubmit={handleFormSubmit}
              defaultValues={editingVehicle ?? undefined}
              isPending={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={paginatedVehicles}
        pageCount={totalPages}
        pageIndex={currentPage - 1}
        pageSize={ITEMS_PER_PAGE}
        setPagination={() => {}}
        isLoading={isLoading}
        filters={filtersComponent}
      />

      {!isLoading && vehicles.length > 0 && (
        <div className="flex justify-center pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
