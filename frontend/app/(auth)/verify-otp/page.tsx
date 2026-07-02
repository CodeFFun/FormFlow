import { GuestOnly } from "@/components/auth/GuestOnly";
import { VerifyOTPForm } from "@/components/auth/VerifyOTPForm";

export default function VerifyOTPPage() {
  return (
    <GuestOnly>
      <VerifyOTPForm />
    </GuestOnly>
  );
}
