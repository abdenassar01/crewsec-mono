"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/common/forms/ImageUpload";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useSafeQuery } from "@/lib/hooks";
import { api } from "@convex/_generated/api";
import { useState } from "react";

type UserFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"users">> | null;
  isPending: boolean;
};

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  role: z.enum(["CLIENT", "EMPLOYEE", "ADMIN"]),
  enabled: z.boolean().optional(),
  password: z.string().optional(),
  organizationId: z.string().optional(),
});

export function UserForm({ onSubmit, defaultValues, isPending }: UserFormProps) {
  const isEditMode = !!defaultValues?._id;

  const currentUser = useSafeQuery(api.users.getCurrentUserProfile);
  const organizations = useSafeQuery(api.organizations.list);
  const isSuperAdmin = (currentUser as any)?.role === "SUPER_ADMIN";
  const orgList = (organizations as any[]) ?? [];

  const [currentAvatar, setCurrentAvatar] = useState<File | null>(null);
  const avatarUrl = (defaultValues as any)?.avatarUrl || null;

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      role: defaultValues?.role ?? "CLIENT",
      enabled: defaultValues?.enabled ?? true,
      password: "",
      organizationId: (defaultValues as any)?.organizationId ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit({ ...value, avatarImage: currentAvatar }, isEditMode);
    },
  });

  const handleAvatarChange = (file: File | null) => {
    setCurrentAvatar(file);
  };

  const handleAvatarRemove = () => {
    setCurrentAvatar(null);
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
        value={avatarUrl}
        onChange={handleAvatarChange}
        onRemove={handleAvatarRemove}
        disabled={isPending}
        label="Avatar"
      />
      <form.Field
        name="name"
        validators={{ onChange: userSchema.shape.name }}
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
        name="email"
        validators={{ onChange: userSchema.shape.email }}
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
        name="role"
        validators={{
          onChange: z.enum(["CLIENT", "EMPLOYEE", "ADMIN"]),
        }}
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Role</Label>
            <select
              id={field.name}
              onChange={(e) => field.handleChange(e.target.value as "CLIENT" | "EMPLOYEE" | "ADMIN")}
              value={field.state.value}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="CLIENT">Client</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
            {field.state.meta.errors ? (
              <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      />
      {isSuperAdmin && orgList.length > 0 && (
        <form.Field
          name="organizationId"
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Organization</Label>
              <select
                id={field.name}
                onChange={(e) => field.handleChange(e.target.value as any)}
                value={field.state.value}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">No Organization</option>
                {orgList.map((org: any) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        />
      )}
      <form.Field
        name="enabled"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor={field.name}>Enabled</Label>
          </div>
        )}
      />

      {!isEditMode && (
        <form.Field
          name="password"
          validators={{
            onChange: z.string().min(6, "Password must be at least 6 characters"),
          }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Password</Label>
              <Input type="password" id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
              {field.state.meta.errors ? (
                <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        />
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save User"}
      </Button>
    </form>
  );
}
