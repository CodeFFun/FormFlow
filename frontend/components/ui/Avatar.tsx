import Image from "next/image";
import { cn, initials, uploadUrl } from "@/lib/utils";

export interface AvatarProps {
  name?: string;
  email?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

const pixelSizes = { sm: 32, md: 40, lg: 64 };

export function Avatar({
  name,
  email,
  src,
  size = "md",
  className,
}: AvatarProps) {
  const resolved = uploadUrl(src);
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-medium text-indigo-700",
        sizes[size],
        className,
      )}
    >
      {resolved ? (
        <Image
          src={resolved}
          alt={name || email || "Avatar"}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="h-full w-full object-cover"
        />
      ) : (
        initials(name, email)
      )}
    </span>
  );
}
