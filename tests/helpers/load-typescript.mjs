import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import ts from "typescript";

const require = createRequire(import.meta.url);

/** Evaluate real server code with fake configuration and no possible real fetch. */
export function loadTypeScript(path, fetchMock = async () => { throw new Error("Network disabled in tests"); }, env = {}) {
  const cache = new Map();
  const environment = { env: {
    TURNSTILE_SECRET_KEY: "test-only-secret",
    RESEND_API_KEY: "test-only-key",
    RESEND_FROM_EMAIL: "form@example.invalid",
    OFFER_RECIPIENT_EMAIL: "leads@example.invalid",
    ...env,
  } };
  function load(modulePath) {
    if (cache.has(modulePath)) return cache.get(modulePath).exports;
    const compiledModule = { exports: {} };
    cache.set(modulePath, compiledModule);
    const compiled = ts.transpileModule(readFileSync(modulePath, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const localRequire = (specifier) => {
      // Next.js handles this build-time boundary; it has no runtime side effects to emulate.
      if (specifier === "server-only") return {};
      return specifier.startsWith(".") ? load(resolve(dirname(modulePath), `${specifier}.ts`)) : require(specifier);
    };
    new Function("exports", "require", "module", "process", "fetch", compiled)(
      compiledModule.exports, localRequire, compiledModule, environment, fetchMock,
    );
    return compiledModule.exports;
  }
  return load(path);
}
