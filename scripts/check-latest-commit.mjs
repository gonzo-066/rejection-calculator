// Fails a Vercel production build when the commit being built is not the tip
// of main. On 9-nov a "Redeploy" of 601d5e0 replaced the 03ad3ed build and
// silently took the iframe height script off production. A failed build never
// replaces production, so an old redeploy now stops here instead.
// If GitHub can't be asked (timeout, rate limit, outage) the build goes ahead:
// this guard must never block a legitimate deploy.
const sha = process.env.VERCEL_GIT_COMMIT_SHA;
if (process.env.VERCEL_ENV !== "production" || !sha) process.exit(0); // local, preview

const owner = process.env.VERCEL_GIT_REPO_OWNER || "gonzo-066";
const repo = process.env.VERCEL_GIT_REPO_SLUG || "rejection-calculator";
let tip = null;
try {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/main`, {
    headers: { Accept: "application/vnd.github.sha", "User-Agent": "rejection-calculator-build" },
    signal: AbortSignal.timeout(5000),
  });
  if (res.ok) tip = (await res.text()).trim();
  else console.warn(`[check-latest-commit] GitHub answered ${res.status}; skipping the check.`);
} catch (e) {
  console.warn(`[check-latest-commit] GitHub unreachable (${e?.name ?? e}); skipping the check.`);
}
if (tip && /^[0-9a-f]{40}$/.test(tip) && tip !== sha) {
  console.error(`[check-latest-commit] Building ${sha.slice(0, 7)} but main is at ${tip.slice(0, 7)}.`);
  console.error("This looks like a redeploy of an old commit. Redeploy the latest deployment instead.");
  // exitCode, not exit(1): exiting while fetch's socket is still closing
  // crashes Node on Windows (libuv assertion, exit 127).
  process.exitCode = 1;
}
