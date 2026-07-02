import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { InviteTeamForm } from "@/components/onboarding/InviteTeamForm";

export default function OnboardingTeamPage() {
  return (
    <div>
      <OnboardingStepper current="team" />
      <div className="mt-10">
        <InviteTeamForm />
      </div>
    </div>
  );
}
