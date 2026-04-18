"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import type { Doc } from "@convex/_generated/dataModel";

type LocationFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"locations">> | null;
  isPending: boolean;
};

const locationSchema = z.object({
  label: z.string().min(1, "Location name is required"),
});

export function LocationForm({ onSubmit, defaultValues, isPending }: LocationFormProps) {
  const isEditMode = !!defaultValues?._id;

  const form = useForm({
    defaultValues: {
      label: defaultValues?.label ?? "",
    },
    validators: {
      onSubmit: locationSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value, isEditMode);
    },
  });

  return (
    <FormContext.Provider value={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <FieldInput
          name="label"
          label="Location Name"
          placeholder="Enter location name..."
          form={form}
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Location"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}
