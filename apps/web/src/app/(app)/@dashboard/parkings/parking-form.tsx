"use client";

import { useState, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import { ImageUpload } from "@/components/common/forms/ImageUpload";
import { useImageUrl } from "@/hooks/use-image-url";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type { Id } from "@convex/_generated/dataModel";
import type { ParkingWithUser } from "./columns";
import { useSafeMutation } from "@/lib/hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FormValues = {
  // User fields
  email: string;
  name: string;
  phone?: string;
  role: "ADMIN" | "EMPLOYEE" | "CLIENT";
  password?: string;
  // Parking fields
  parkingName: string;
  parkingDescription: string;
  parkingLocation: string;
  parkingWebsite: string;
  parkingAddress: string;
  parkingImage?: File | null;
};

type ParkingFormProps = {
  onSubmit: (data: FormValues, isEdit: boolean) => void;
  defaultValues?: ParkingWithUser;
  isPending: boolean;
};

export function ParkingForm({ onSubmit, defaultValues, isPending }: ParkingFormProps) {
  const isEditMode = !!defaultValues;
  const { getUrl } = useImageUrl();
  const deleteImage = useSafeMutation(api.parkings.deleteImage);
  const resetUserPassword = useSafeMutation(api.users.resetUserPassword);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultValues?.imageStorageId ? getUrl(defaultValues.imageStorageId) : null
  );
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Fetch user details when editing
  const userId = defaultValues?.userId;
  const userDataResult = useQuery(
    api.users.getById,
    userId ? { userId } : "skip"
  );
  
  // Extract data from CustomResponse
  const userData = userDataResult && 'data' in userDataResult ? userDataResult.data : userDataResult;

  // Pre-fill user data from the query
  const defaultUserValues = useMemo(() => {
    if (isEditMode && userData && typeof userData === 'object' && 'email' in userData) {
      return {
        email: userData.email ?? "",
        name: userData.name ?? "",
        phone: userData.phone ?? "",
        role: userData.role ?? "CLIENT",
      };
    }
    return {
      email: "",
      name: "",
      phone: "",
      role: "CLIENT" as const,
    };
  }, [isEditMode, userData]);

  const form = useForm({
    defaultValues: {
      ...defaultUserValues,
      password: "",
      parkingName: defaultValues?.name ?? "",
      parkingDescription: defaultValues?.description ?? "",
      parkingLocation: defaultValues?.location ?? "",
      parkingWebsite: defaultValues?.website ?? "",
      parkingAddress: defaultValues?.address ?? "",
      userId: defaultValues?.userId,
      parkingImage: null,
    },
    onSubmit: async ({ value }) => {
      const dataToSubmit = currentImage
        ? { ...value, parkingImage: currentImage }
        : value;
      onSubmit(dataToSubmit as FormValues, isEditMode);
    },
  });

  const handleImageChange = (file: File | null) => {
    setCurrentImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(defaultValues?.imageStorageId ? getUrl(defaultValues.imageStorageId) : null);
    }
  };

  const handleImageRemove = async () => {
    if (defaultValues?.imageStorageId) {
      await deleteImage({ storageId: defaultValues.imageStorageId });
    }
    setCurrentImage(null);
    setPreviewUrl(null);
  };

  return (
    <FormContext.Provider value={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-semibold">User Details</h3>
          {userData && typeof userData === 'object' && 'avatar' in userData && userData.avatar && (
            <div className="flex items-center gap-4">
              <img
                src={userData.avatar}
                alt="User avatar"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <span className="text-sm text-muted-foreground">User Avatar</span>
            </div>
          )}
          <FieldInput
            name="email"
            label="Email"
            placeholder="user@example.com"
            type="email"
            form={form}
            disabled={isPending}
          />
          <FieldInput
            name="name"
            label="Full Name"
            placeholder="John Doe"
            form={form}
            disabled={isPending}
          />
          <FieldInput
            name="phone"
            label="Phone"
            placeholder="+1234567890"
            form={form}
            disabled={isPending}
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <form.Field
                name="role"
                children={(field) => (
                  <div>
                    <label htmlFor={field.name} className="text-sm font-medium">Role</label>
                    <select
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as "ADMIN" | "EMPLOYEE" | "CLIENT")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={isPending}
                    >
                      <option value="CLIENT">Client</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                )}
              />
            </div>
            {!isEditMode && (
              <div className="flex-1">
                <FieldInput
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  form={form}
                  disabled={isPending}
                />
              </div>
            )}
          </div>
          {isEditMode && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Reset Password</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                >
                  {showResetPassword ? "Cancel" : "Change Password"}
                </Button>
              </div>
              {showResetPassword && (
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 characters)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={!newPassword || newPassword.length < 8}
                    onClick={async () => {
                      if (!defaultValues?.userId) return;
                      const result = await resetUserPassword({
                        userId: defaultValues.userId,
                        newPassword,
                      });
                      if (result !== null) {
                        toast.success("Password reset successfully!");
                        setShowResetPassword(false);
                        setNewPassword("");
                      }
                    }}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-semibold">Parking Details</h3>
          <ImageUpload
            value={previewUrl}
            onChange={handleImageChange}
            onRemove={handleImageRemove}
            disabled={isPending}
          />
          <FieldInput
            name="parkingName"
            label="Parking Name"
            placeholder="Main Street Parking"
            form={form}
            disabled={isPending}
          />
          <FieldInput
            name="parkingAddress"
            label="Address"
            placeholder="123 Main St"
            form={form}
            disabled={isPending}
          />
          <FieldInput
            name="parkingLocation"
            label="Location (City)"
            placeholder="Metropolis"
            form={form}
            disabled={isPending}
          />
          <FieldInput
            name="parkingWebsite"
            label="Website URL"
            placeholder="https://parking.com"
            type="url"
            form={form}
            disabled={isPending}
          />
          <FieldInput
            name="parkingDescription"
            label="Description"
            placeholder="A short description..."
            form={form}
            disabled={isPending}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Create User & Parking"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}
