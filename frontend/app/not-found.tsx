import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Compass className="h-8 w-8" />
        </span>
        <p className="font-serif text-5xl text-ink-900">404</p>
        <h1 className="mt-2 font-serif text-2xl text-ink-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
