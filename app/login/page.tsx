"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import AuthShell, { AuthFooterLink } from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import SubmitButton from "@/components/auth/SubmitButton";
import { emailRules, loginPasswordRules } from "@/lib/authValidation";
import { useLogin } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ mode: "onTouched" });

  const onSubmit: SubmitHandler<LoginFormValues> = (values) => {
    login.mutate(values, {
      onSuccess: () => router.push("/practice"),
    });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your SQL interview prep."
      footer={
        <AuthFooterLink prompt="New to CareerCafe?" href="/signup" label="Create an account" />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          {...register("email", emailRules)}
        />

        <div>
          <FormField
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password}
            {...register("password", loginPasswordRules)}
          />
          <div className="mt-2 text-right">
            <a href="#" className="text-[13px] font-semibold text-brand hover:text-brand-dark">
              Forgot password?
            </a>
          </div>
        </div>

        {login.isError && (
          <p className="text-[13px] font-medium text-rose-500" role="alert">
            {getApiErrorMessage(login.error, "Invalid email or password.")}
          </p>
        )}

        <SubmitButton pending={login.isPending}>
          {login.isPending ? "Logging in…" : "Log in"}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
