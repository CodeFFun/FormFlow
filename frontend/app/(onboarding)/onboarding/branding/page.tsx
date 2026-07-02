import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { BrandingSetupForm } from "@/components/onboarding/BrandingSetupForm";

export default function OnboardingBrandingPage() {
  return (
    <div>
      <OnboardingStepper current="branding" />
      <div className="mt-10">
        <BrandingSetupForm />
      </div>
    </div>
  );
}
