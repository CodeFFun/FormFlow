import Image from "next/image";
import { uploadUrl } from "@/lib/utils";

export interface BrandingPreviewProps {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

export function BrandingPreview({
  name,
  logoUrl,
  primaryColor,
  secondaryColor,
}: BrandingPreviewProps) {
  const resolved = uploadUrl(logoUrl);
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
      <div className="h-20" style={{ backgroundColor: primaryColor }} />
      <div className="px-5 pb-5">
        <div className="-mt-8 flex items-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-ink-100">
            {resolved ? (
              <Image
                src={resolved}
                alt={name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-serif text-lg text-ink-500">
                {name.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-lg text-ink-900">
          {name || "Your organization"}
        </h3>
        <p className="text-sm text-ink-500">Customer feedback survey</p>
        <button
          type="button"
          className="mt-4 rounded-full px-5 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: secondaryColor }}
        >
          Start
        </button>
      </div>
    </div>
  );
}
