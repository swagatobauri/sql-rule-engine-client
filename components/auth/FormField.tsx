"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: { message?: string };
  hint?: string;
}

// Labelled input wired for react-hook-form. Spread `register(name, rules)`
// onto it and pass the field's error object; it renders the message + a11y state.
// NOTE: shadcn's <Input> does not forward refs on React 18, so we keep a native
// <input> (with matching styling) to preserve react-hook-form's ref registration.
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, type = "text", error, hint, ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div>
      <Label htmlFor={props.name} className="mb-1.5 block text-[13.5px] font-semibold text-ink">
        {label}
      </Label>
      <div className="relative">
        <input
          ref={ref}
          id={props.name}
          type={inputType}
          aria-invalid={error ? "true" : "false"}
          className={cn(
            "h-[46px] w-full rounded-xl border bg-white px-3.5 text-[14.5px] text-ink placeholder:text-body/55 outline-none transition-colors",
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              : "border-black/10 focus:border-brand focus:ring-2 focus:ring-brand-soft",
            isPassword && "pr-11"
          )}
          {...props}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-body/60 hover:text-ink"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-[12.5px] font-medium text-rose-500">
          <AlertCircle size={13} /> {error.message}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[12.5px] text-body">{hint}</p>
      ) : null}
    </div>
  );
});

export default FormField;
