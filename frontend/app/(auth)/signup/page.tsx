import { GuestOnly } from "@/components/auth/GuestOnly";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <GuestOnly>
      <SignupForm />
    </GuestOnly>
  );
}
