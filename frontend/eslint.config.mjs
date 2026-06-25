import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // This app gates routes on the client (auth token + selected org live in
      // localStorage). The idiomatic way to read client-only state without an
      // SSR hydration mismatch is to do it in an effect and setState after
      // mount. The newer react-hooks rule flags that as cascading renders, but
      // here it is deliberate and bounded — downgrade to a warning.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
