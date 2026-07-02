import { CheckCircle2 } from "lucide-react";

const highlights = [
  "Build forms with ten question types",
  "Target responses by team or audience group",
  "Track submissions and share securely",
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-indigo-700 p-12 text-white lg:flex">
      <div
        aria-hidden
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/50 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl"
      />
      <div className="relative">
        <span className="font-serif text-2xl font-semibold tracking-tight">
          FormFlow
        </span>
      </div>
      <div className="relative">
        <h1 className="font-serif text-4xl leading-tight">
          Forms that move at the speed of your team.
        </h1>
        <ul className="mt-8 space-y-4">
          {highlights.map((h) => (
            <li key={h} className="flex items-start gap-3 text-indigo-50">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-200" />
              <span className="text-sm">{h}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-xs text-indigo-200">
        © {new Date().getFullYear()} FormFlow. All rights reserved.
      </p>
    </div>
  );
}
