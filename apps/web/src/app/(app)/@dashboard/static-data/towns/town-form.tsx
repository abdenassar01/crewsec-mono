"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useSafeQuery } from "@/lib/hooks";

type TownFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"towns">> | null;
  isPending: boolean;
};

const townSchema = z.object({
  label: z.string().min(1, "Town name is required"),
  number: z.number().min(1, "Number must be positive"),
  locationId: z.string().min(1, "Location is required"),
});

export function TownForm({ onSubmit, defaultValues, isPending }: TownFormProps) {
  const isEditMode = !!defaultValues?._id;
  const locations = useSafeQuery(api.staticData.listLocations, { search: '' });

  const form = useForm({
    defaultValues: {
      label: defaultValues?.label ?? "",
      number: defaultValues?.number ?? 1,
      locationId: defaultValues?.locationId ?? "",
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
          label="Town Name"
          placeholder="Enter town name..."
          form={form}
          required
        />
        <FieldInput
          name="number"
          label="Number"
          type="number"
          placeholder="1"
          form={form}
          required
        />
        <form.Field
          name="locationId"
          validators={{ onChange: townSchema.shape.locationId }}
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="text-sm font-medium">Location</label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {(locations ?? []).map((location) => (
                    <SelectItem key={location._id} value={location._id}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-sm text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p>
              )}
            </div>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Town"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}