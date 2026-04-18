"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { Doc } from "@convex/_generated/dataModel";
import { AddSquareFreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { api } from "@convex/_generated/api";

import { TownsListClient } from "./towns/towns-list-client";
import { TownForm } from "./towns/town-form";

import { ViolationsListClient } from "./violations/violations-list-client";
import { ViolationForm } from "./violations/violation-form";

import { LocationViolationsListClient } from "./location-violations/location-violations-list-client";
import { LocationViolationForm } from "./location-violations/location-violation-form";

import { LocationsListClient } from "./locations/locations-list-client";
import { LocationForm } from "./locations/location-form";

type Town = Doc<"towns">;
type Violation = Doc<"violations">;
type LocationViolation = Doc<"locationViolations">;
type Location = Doc<"locations">;
type StaticDataItem = Town | Violation | LocationViolation | Location;

export default function StaticDataPage() {
  const [selectedTab, setSelectedTab] = useState("locations");
  const [editingItem, setEditingItem] = useState<StaticDataItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaticDataItem | null>(null);

  const createTown = useMutation(api.staticData.createTown);
  const updateTown = useMutation(api.staticData.updateTown);
  const deleteTown = useMutation(api.staticData.deleteTown);

  const createViolation = useMutation(api.staticData.createViolation);
  const updateViolation = useMutation(api.staticData.updateViolation);
  const deleteViolation = useMutation(api.staticData.deleteViolation);

  const createLocationViolation = useMutation(api.staticData.createLocationViolation);
  const updateLocationViolation = useMutation(api.staticData.updateLocationViolation);
  const deleteLocationViolation = useMutation(api.staticData.deleteLocationViolation);

  const createLocation = useMutation(api.staticData.createLocation);
  const updateLocation = useMutation(api.staticData.updateLocation);
  const deleteLocation = useMutation(api.staticData.deleteLocation);

  const handleEdit = (item: StaticDataItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleDelete = (item: StaticDataItem) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsPending(true);
    try {
      switch (selectedTab) {
        case "towns":
          await deleteTown({ id: deleteTarget._id as Town["_id"] });
          toast.success("Town deleted successfully!");
          break;
        case "violations":
          await deleteViolation({ id: deleteTarget._id as Violation["_id"] });
          toast.success("Violation deleted successfully!");
          break;
        case "location-violations":
          await deleteLocationViolation({ id: deleteTarget._id as LocationViolation["_id"] });
          toast.success("Location violation deleted successfully!");
          break;
        case "locations":
          await deleteLocation({ id: deleteTarget._id as Location["_id"] });
          toast.success("Location deleted successfully!");
          break;
      }
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Error deleting item");
    } finally {
      setIsPending(false);
    }
  };

  const renderForm = () => {
    if (!isFormOpen) return null;

    switch (selectedTab) {
      case "locations":
        return (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Location" : "Create Location"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update the location details below." : "Enter the details for the new location."}
                </DialogDescription>
              </DialogHeader>
              <LocationForm
                onSubmit={async (data, isEdit) => {
                  setIsPending(true);
                  try {
                    if (isEdit && editingItem) {
                      await updateLocation({ id: editingItem._id as Location["_id"], ...data });
                      toast.success("Location updated successfully!");
                    } else {
                      await createLocation(data);
                      toast.success("Location created successfully!");
                    }
                    setIsFormOpen(false);
                    setEditingItem(null);
                  } catch (error: any) {
                    toast.error(error.message || "Error saving location");
                  } finally {
                    setIsPending(false);
                  }
                }}
                defaultValues={editingItem as Location | null}
                isPending={isPending}
              />
            </DialogContent>
          </Dialog>
        );
      case "towns":
        return (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Town" : "Create Town"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update the town details below." : "Enter the details for the new town."}
                </DialogDescription>
              </DialogHeader>
              <TownForm
                onSubmit={async (data, isEdit) => {
                  setIsPending(true);
                  try {
                    if (isEdit && editingItem) {
                      await updateTown({ id: editingItem._id as Town["_id"], ...data });
                      toast.success("Town updated successfully!");
                    } else {
                      await createTown(data);
                      toast.success("Town created successfully!");
                    }
                    setIsFormOpen(false);
                    setEditingItem(null);
                  } catch (error: any) {
                    toast.error(error.message || "Error saving town");
                  } finally {
                    setIsPending(false);
                  }
                }}
                defaultValues={editingItem as Town | null}
                isPending={isPending}
              />
            </DialogContent>
          </Dialog>
        );
      case "violations":
        return (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Violation" : "Create Violation"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update the violation details below." : "Enter the details for the new violation."}
                </DialogDescription>
              </DialogHeader>
              <ViolationForm
                onSubmit={async (data, isEdit) => {
                  setIsPending(true);
                  try {
                    if (isEdit && editingItem) {
                      await updateViolation({ id: editingItem._id as Violation["_id"], ...data });
                      toast.success("Violation updated successfully!");
                    } else {
                      await createViolation(data);
                      toast.success("Violation created successfully!");
                    }
                    setIsFormOpen(false);
                    setEditingItem(null);
                  } catch (error: any) {
                    toast.error(error.message || "Error saving violation");
                  } finally {
                    setIsPending(false);
                  }
                }}
                defaultValues={editingItem as Violation | null}
                isPending={isPending}
              />
            </DialogContent>
          </Dialog>
        );
      case "location-violations":
        return (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Location Violation" : "Create Location Violation"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update the location violation details below." : "Enter the details for the new location violation."}
                </DialogDescription>
              </DialogHeader>
              <LocationViolationForm
                onSubmit={async (data, isEdit) => {
                  setIsPending(true);
                  try {
                    if (isEdit && editingItem) {
                      await updateLocationViolation({ id: editingItem._id as LocationViolation["_id"], ...data });
                      toast.success("Location violation updated successfully!");
                    } else {
                      await createLocationViolation(data);
                      toast.success("Location violation created successfully!");
                    }
                    setIsFormOpen(false);
                    setEditingItem(null);
                  } catch (error: any) {
                    toast.error(error.message || "Error saving location violation");
                  } finally {
                    setIsPending(false);
                  }
                }}
                defaultValues={editingItem as LocationViolation | null}
                isPending={isPending}
              />
            </DialogContent>
          </Dialog>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Static Data Management</h1>
        <Button onClick={handleAdd}>
          <HugeiconsIcon icon={AddSquareFreeIcons} className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="towns">Towns</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="location-violations">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          <LocationsListClient onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </TabsContent>

        <TabsContent value="towns" className="space-y-4">
          <TownsListClient onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <ViolationsListClient onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </TabsContent>

        <TabsContent value="location-violations" className="space-y-4">
          <LocationViolationsListClient onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </TabsContent>
      </Tabs>

      {renderForm()}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
