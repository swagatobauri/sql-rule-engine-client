"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import AuthShell, { AuthFooterLink } from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import SubmitButton from "@/components/auth/SubmitButton";
import {
  confirmPasswordRules,
  emailRules,
  nameRules,
  passwordRules,
} from "@/lib/authValidation";
import { useRegister } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupFormValues>({ mode: "onTouched" });

  // Only email + password are sent — the backend register endpoint doesn't
  // accept name/confirmPassword (those are client-side only).
  const onSubmit: SubmitHandler<SignupFormValues> = ({ email, password }) => {
    registerUser.mutate(
      { email, password },
      { onSuccess: () => router.push("/practice") },
    );
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start practicing SQL the way interviews test it."
      footer={
        <AuthFooterLink prompt="Already have an account?" href="/login" label="Log in" />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField
          label="Full name"
          placeholder="Amit Sharma"
          autoComplete="name"
          error={errors.name}
          {...register("name", nameRules)}
        />

        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          {...register("email", emailRules)}
        />

        <FormField
          label="Password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
          {...register("password", passwordRules)}
        />

        <FormField
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          {...register("confirmPassword", confirmPasswordRules(getValues))}
        />

        {registerUser.isError && (
          <p className="text-[13px] font-medium text-rose-500" role="alert">
            {getApiErrorMessage(registerUser.error, "Could not create your account.")}
          </p>
        )}

        <SubmitButton pending={registerUser.isPending}>
          {registerUser.isPending ? "Creating account…" : "Create account"}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
