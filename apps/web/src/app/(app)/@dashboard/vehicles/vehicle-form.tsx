"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Doc } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { useSafeQuery } from "@/lib/hooks";
import { useMemo } from "react";

type VehicleFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"vehicles">> | null;
  isPending: boolean;
};

const vehicleSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  name: z.string().min(1, "Name is required"),
  joinDate: z.number().min(1, "Join date is required"),
  leaveDate: z.number().min(1, "Leave date is required"),
  parkingId: z.string().min(1, "Parking is required"),
});

export function VehicleForm({ onSubmit, defaultValues, isPending }: VehicleFormProps) {
  const isEditMode = !!defaultValues?._id;
  const parkingsData = useSafeQuery(api.parkings.list, { query: '' });

  const parkings = useMemo(() => {
    if (!parkingsData) return [];
    return parkingsData.filter((p) => !p.name.startsWith('[Anonymized'));
  }, [parkingsData]);

  const getTodayStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const form = useForm({
    defaultValues: {
      reference: defaultValues?.reference ?? "",
      name: defaultValues?.name ?? "",
      joinDate: defaultValues?.joinDate ?? (() => { const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0); return d.getTime(); })(),
      leaveDate: defaultValues?.leaveDate ?? (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0,0,0,0); return d.getTime(); })(),
      parkingId: defaultValues?.parkingId ?? "",
    },
    onSubmit: async ({ value }) => {
      if (!isEditMode && Date.now() >= value.joinDate) {
        alert("Join date and time must be in the future");
        return;
      }
      if (value.leaveDate <= value.joinDate) {
        alert("Leave date must be after join date");
        return;
      }
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
          name="reference"
          label="Reference (License Plate)"
          placeholder="ABC-123"
          form={form}
          required
        />
        <FieldInput
          name="name"
          label="Vehicle Name"
          placeholder="My Car"
          form={form}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-2">Parking</label>
          <form.Field
            name="parkingId"
            validators={{ onChange: vehicleSchema.shape.parkingId }}
            children={(field) => (
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parking" />
                </SelectTrigger>
                <SelectContent>
                  {(parkings ?? []).map((parking) => (
                    <SelectItem key={parking._id} value={parking._id}>
                      {parking.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Join Date</label>
          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="joinDate"
              validators={{ onChange: vehicleSchema.shape.joinDate }}
              children={(field) => (
                <DatePicker
                  value={field.state.value}
                  onChange={(timestamp) => {
                    const now = new Date();
                    const selected = new Date(timestamp);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (!isEditMode && selected.getTime() === today.getTime()) {
                      selected.setHours(now.getHours(), now.getMinutes(), 0, 0);
                    } else {
                      const existingDate = new Date(field.state.value);
                      selected.setHours(existingDate.getHours(), existingDate.getMinutes(), 0, 0);
                    }
                    field.handleChange(selected.getTime());
                  }}
                  placeholder="Select join date"
                  fromDate={isEditMode ? undefined : getTodayStart()}
                />
              )}
            />
            <form.Field
              name="joinDate"
              children={(field) => (
                <TimePicker
                  value={field.state.value}
                  onChange={(timestamp) => {
                    if (!isEditMode && timestamp < Date.now()) {
                      const now = new Date();
                      now.setMinutes(now.getMinutes() + 1, 0, 0);
                      field.handleChange(now.getTime());
                    } else {
                      field.handleChange(timestamp);
                    }
                  }}
                  dateTimestamp={field.state.value}
                  placeholder="Select time"
                />
              )}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Leave Date</label>
          <form.Field
            name="leaveDate"
            validators={{ onChange: vehicleSchema.shape.leaveDate }}
            children={(field) => (
              <DatePicker
                value={field.state.value}
                onChange={(timestamp) => field.handleChange(timestamp)}
                placeholder="Select leave date"
              />
            )}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Vehicle"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}