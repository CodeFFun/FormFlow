import { cn } from "@/lib/utils";

export function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const colors = [
  "bg-coral-600",
  "bg-coral-600",
  "bg-amber-600",
  "bg-indigo-500",
  "bg-teal-600",
];

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < score ? colors[score] : "bg-ink-100",
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-500">{labels[score]}</p>
    </div>
  );
}
