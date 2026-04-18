"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Doc } from "@convex/_generated/dataModel";
import { useSafeQuery } from "@/lib/hooks";
import { api } from "@convex/_generated/api";

type ControlFeeFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"controlFees">> | null;
  isPending: boolean;
};

const controlFeeSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  mark: z.string().min(1, "Mark is required"),
  startDate: z.number().min(1, "Start date is required"),
  endDate: z.number().min(1, "End date is required"),
  isSignsChecked: z.boolean(),
  isPhotosTaken: z.boolean(),
  status: z.union([
    z.literal("AWAITING"),
    z.literal("PAID"),
    z.literal("CANCELED"),
    z.literal("CONFLICT"),
  ]),
  townId: z.string().min(1, "Town is required"),
  locationViolationId: z.string().min(1, "Location violation is required"),
});

const statusColors: Record<string, string> = {
  AWAITING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
  CONFLICT: "bg-orange-100 text-orange-800",
};

export function ControlFeeForm({ onSubmit, defaultValues, isPending }: ControlFeeFormProps) {
  const isEditMode = !!defaultValues?._id;
  const towns = useSafeQuery(api.staticData.listTowns, { search: "" });
  const locationViolations = useSafeQuery(api.staticData.listLocationViolations, {});
  const violations = useSafeQuery(api.staticData.listViolations, { search: "" });
  const locations = useSafeQuery(api.staticData.listLocations, { search: "" });

  const violationMap = React.useMemo(() => {
    if (!Array.isArray(violations)) return new Map<string, string>();
    const map = new Map<string, string>();
    violations.forEach((v: any) => map.set(v._id, v.label));
    return map;
  }, [violations]);

  const locationMap = React.useMemo(() => {
    if (!Array.isArray(locations)) return new Map<string, string>();
    const map = new Map<string, string>();
    locations.forEach((l: any) => map.set(l._id, l.label));
    return map;
  }, [locations]);

  const form = useForm({
    defaultValues: {
      reference: defaultValues?.reference ?? "",
      mark: defaultValues?.mark ?? "",
      startDate: defaultValues?.startDate ?? Date.now(),
      endDate: defaultValues?.endDate ?? Date.now() + 86400000,
      isSignsChecked: defaultValues?.isSignsChecked ?? false,
      isPhotosTaken: defaultValues?.isPhotosTaken ?? false,
      status: defaultValues?.status ?? "AWAITING",
      townId: defaultValues?.townId ?? "",
      locationViolationId: defaultValues?.locationViolationId ?? "",
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
        <FieldInput name="reference" label="Reference" placeholder="REF-001" form={form} required />
        <FieldInput name="mark" label="Mark" placeholder="Mark A" form={form} required />

        <form.Field
          name="status"
          validators={{ onChange: controlFeeSchema.shape.status }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Status</Label>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange(v as any)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {(["AWAITING", "PAID", "CANCELED", "CONFLICT"] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      <Badge className={statusColors[s]}>{s}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="townId"
          validators={{ onChange: controlFeeSchema.shape.townId }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Town</Label>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select town" /></SelectTrigger>
                <SelectContent>
                  {Array.isArray(towns) && towns.map((town: any) => (
                    <SelectItem key={town._id} value={town._id}>{town.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="locationViolationId"
          validators={{ onChange: controlFeeSchema.shape.locationViolationId }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Location Violation</Label>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select location violation" /></SelectTrigger>
                <SelectContent>
                  {Array.isArray(locationViolations) && locationViolations.map((lv: any) => (
                    <SelectItem key={lv._id} value={lv._id}>
                      {locationMap.get(lv.locationId) ?? "Unknown"} — {violationMap.get(lv.violationId) ?? "Unknown"} ({lv.price} Kr)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="startDate"
          validators={{ onChange: controlFeeSchema.shape.startDate }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Start Date</Label>
              <Input
                type="datetime-local"
                id={field.name}
                onChange={(e) => field.handleChange(new Date(e.target.value).getTime())}
                value={new Date(field.state.value).toISOString().slice(0, 16)}
              />
            </div>
          )}
        />

        <form.Field
          name="endDate"
          validators={{ onChange: controlFeeSchema.shape.endDate }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>End Date</Label>
              <Input
                type="datetime-local"
                id={field.name}
                onChange={(e) => field.handleChange(new Date(e.target.value).getTime())}
                value={new Date(field.state.value).toISOString().slice(0, 16)}
              />
            </div>
          )}
        />

        <div className="flex space-x-4">
          <form.Field name="isSignsChecked" children={(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox id={field.name} checked={field.state.value} onCheckedChange={(c) => field.handleChange(c as boolean)} />
              <Label htmlFor={field.name}>Signs Checked</Label>
            </div>
          )} />
          <form.Field name="isPhotosTaken" children={(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox id={field.name} checked={field.state.value} onCheckedChange={(c) => field.handleChange(c as boolean)} />
              <Label htmlFor={field.name}>Photos Taken</Label>
            </div>
          )} />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Control Fee"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}
