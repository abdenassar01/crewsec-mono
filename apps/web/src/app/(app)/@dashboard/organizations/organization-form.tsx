"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/common/forms/ImageUpload";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useSafeQuery } from "@/lib/hooks";
import { api } from "@convex/_generated/api";

type OrganizationFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"organizations"> & { logoUrl?: string }> | null;
  isPending: boolean;
};

const orgSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  subscriptionStatus: z.enum(["ACTIVE", "INACTIVE", "TRIAL"]).optional(),
});

export function OrganizationForm({ onSubmit, defaultValues, isPending }: OrganizationFormProps) {
  const isEditMode = !!defaultValues?._id;

  const orgDetails = useSafeQuery(
    api.organizations.getById,
    isEditMode && defaultValues?._id ? { id: defaultValues._id } : ("skip" as any)
  );
  const logoUrl = (orgDetails as any)?.data?.logoUrl || (orgDetails as any)?.logoUrl || null;

  const [currentLogo, setCurrentLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl);

  useEffect(() => {
    if (logoUrl) setPreviewUrl(logoUrl);
  }, [logoUrl]);

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      website: defaultValues?.website ?? "",
      subscriptionStatus: defaultValues?.subscriptionStatus ?? "TRIAL",
    },
    onSubmit: async ({ value }) => {
      const dataToSubmit = currentLogo
        ? { ...value, logoImage: currentLogo }
        : value;
      await onSubmit(dataToSubmit, isEditMode);
    },
  });

  const handleLogoChange = (file: File | null) => {
    setCurrentLogo(file);
  };

  const handleLogoRemove = () => {
    setCurrentLogo(null);
    setPreviewUrl(null);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <ImageUpload
        value={previewUrl}
        onChange={handleLogoChange}
        onRemove={handleLogoRemove}
        disabled={isPending}
        label="Organization Logo"
      />
      <form.Field
        name="name"
        validators={{ onChange: orgSchema.shape.name }}
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Name</Label>
            <Input id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
            {field.state.meta.errors ? (
              <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      />
      <form.Field
        name="description"
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Description</Label>
            <Input id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
          </div>
        )}
      />
      <form.Field
        name="email"
        validators={{ onChange: orgSchema.shape.email }}
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Email</Label>
            <Input type="email" id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
            {field.state.meta.errors ? (
              <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      />
      <form.Field
        name="phone"
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Phone</Label>
            <Input id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
          </div>
        )}
      />
      <form.Field
        name="address"
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Address</Label>
            <Input id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
          </div>
        )}
      />
      <form.Field
        name="website"
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Website</Label>
            <Input id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
          </div>
        )}
      />
      <form.Field
        name="subscriptionStatus"
        validators={{
          onChange: z.enum(["ACTIVE", "INACTIVE", "TRIAL"]),
        }}
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Subscription Status</Label>
            <select
              id={field.name}
              onChange={(e) => field.handleChange(e.target.value as "ACTIVE" | "INACTIVE" | "TRIAL")}
              value={field.state.value}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="TRIAL">Trial</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            {field.state.meta.errors ? (
              <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Organization"}
      </Button>
    </form>
  );
}
