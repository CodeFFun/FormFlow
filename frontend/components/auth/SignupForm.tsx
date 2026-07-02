"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input, FieldError } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PasswordStrengthBar } from "./PasswordStrengthBar";

const schema = z.object({
  firstName: z.string().min(2, "First name is too short").max(100),
  lastName: z.string().min(2, "Last name is too short").max(100),
  username: z.string().min(2, "Username is too short").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export function SignupForm() {
  const router = useRouter();
  const { success } = useToast();
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await api.post("/auth/register", parsed.data);
      success("Account created. Please sign in.");
      router.push("/login");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Could not create account.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink-900">Create your account</h1>
      <p className="mt-2 text-sm text-ink-500">
        Start building forms in minutes.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {formError && (
          <p className="rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-600">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName" required>
              First name
            </Label>
            <Input
              id="firstName"
              className="mt-1.5"
              value={values.firstName}
              onChange={set("firstName")}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <FieldError message={errors.firstName} />
          </div>
          <div>
            <Label htmlFor="lastName" required>
              Last name
            </Label>
            <Input
              id="lastName"
              className="mt-1.5"
              value={values.lastName}
              onChange={set("lastName")}
              error={errors.lastName}
              autoComplete="family-name"
            />
            <FieldError message={errors.lastName} />
          </div>
        </div>
        <div>
          <Label htmlFor="username" required>
            Username
          </Label>
          <Input
            id="username"
            className="mt-1.5"
            value={values.username}
            onChange={set("username")}
            error={errors.username}
            autoComplete="username"
          />
          <FieldError message={errors.username} />
        </div>
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            value={values.email}
            onChange={set("email")}
            error={errors.email}
            autoComplete="email"
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label htmlFor="password" required>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            className="mt-1.5"
            value={values.password}
            onChange={set("password")}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordStrengthBar password={values.password} />
          <FieldError message={errors.password} />
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
