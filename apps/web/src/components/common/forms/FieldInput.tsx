import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeFreeIcons, ViewOffSlashFreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Field } from "@tanstack/react-form";
import React from "react";

type FieldInputProps = Omit<React.ComponentProps<"input">, "form"> & {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  password?: boolean;
  form: any;
  required?: boolean;
};

export function FieldInput({ name, label, placeholder, type = "text", password, form, required, ...props }: FieldInputProps) {
  const [showPassword, setShowPassword] = React.useState(password);
  return (
    <Field
      form={form}
      name={name}
      validators={{
        onChange: ({ value }) => {
          const stringValue = value as string;
          if (required && !stringValue) {
            return `${label} is required`;
          }
          if (type === "email" && stringValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
            return "Invalid email address";
          }
          if (type === "url" && stringValue && !/^https?:\/\/.+/.test(stringValue)) {
            return "Invalid URL (must start with http:// or https://)";
          }
          return undefined;
        },
      }}
      children={(field) => (
        <div className="relative">
          <Label htmlFor={field.name} className="mb-2">{label}{required && "*"}</Label>
          <Input
            id={field.name}
            type={password ? (showPassword ? "text" : "password") : type}
            placeholder={placeholder}
            value={field.state.value as string | number || ""}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            {...props}
          />
          {
            password && (
              <button
              type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-3"
              >
                {password && showPassword ? <HugeiconsIcon className="w-5 h-5" icon={EyeFreeIcons} /> : <HugeiconsIcon className="w-5 h-5" icon={ViewOffSlashFreeIcons} />}
              </button>
            )
          }
          {field.state.meta.errors && (
            <p className="text-sm text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p>
          )}
        </div>
      )}
    />
  );
}