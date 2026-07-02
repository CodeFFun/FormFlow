import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { OrgSetupForm } from "@/components/onboarding/OrgSetupForm";

export default function OnboardingOrganizationPage() {
  return (
    <div>
      <OnboardingStepper current="organization" />
      <div className="mt-10">
        <OrgSetupForm />
      </div>
    </div>
  );
}
