import { GuestOnly } from "@/components/auth/GuestOnly";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  );
}
