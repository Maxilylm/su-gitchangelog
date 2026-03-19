"use client";

import { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface ChangelogStats {
  features: number;
  fixes: number;
  breaking: number;
  other: number;
}

interface GenerateResponse {
  changelog: string;
  stats: ChangelogStats;
}

// ── Constants ──────────────────────────────────────────────────────────────

const PLACEHOLDER_LOG = `a1b2c3d Add user authentication with OAuth2
d4e5f6a Fix memory leak in WebSocket handler
b7c8d9e BREAKING: Remove deprecated /v1/users endpoint
f0a1b2c Update README with deployment instructions
e3d4c5b Add dark mode toggle to settings page
c6b7a8d Fix incorrect date formatting in reports
a9b0c1d Refactor database connection pooling
d2e3f4a Add rate limiting middleware
b5c6d7e Fix typo in error messages
f8a9b0c Update dependencies to latest versions`;

// ── Component ──────────────────────────────────────────────────────────────

export default function Home() {
  const [gitLog, setGitLog] = useState("");
  const [version, setVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [stats, setStats] = useState<ChangelogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"text" | "md" | null>(null);

  const canGenerate = gitLog.trim().length > 0;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    setChangelog("");
    setStats(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gitLog: gitLog.trim(),
          ...(version.trim() && { version: version.trim() }),
        }),
      });

      const data: GenerateResponse & { error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setChangelog(data.changelog);
      setStats(data.stats);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [canGenerate, gitLog, version]);

  const handleCopy = useCallback(
    async (format: "text" | "md") => {
      const content = format === "md" ? changelog : changelog;
      await navigator.clipboard.writeText(content);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    },
    [changelog]
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-black text-sm">
              CL
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#f5f5f5] leading-tight">
                ChangelogAI
              </h1>
              <p className="text-xs text-[#a3a3a3]">
                Git Log to Polished Changelog
              </p>
            </div>
          </div>
          <a
            href="https://github.com/maxilylm/su-changelogai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f5f5f5] mb-3 tracking-tight">
            Turn Git Logs into Changelogs
          </h2>
          <p className="text-[#a3a3a3] text-lg max-w-2xl mx-auto">
            Paste your <code className="font-mono text-cyan-400 text-base">git log</code> output and get a polished, grouped changelog instantly.
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-8">
          {/* Version + Date Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#d4d4d4] mb-1.5">
                Version <span className="text-[#a3a3a3] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. v2.1.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#262626] bg-[#141414] text-[#f5f5f5] text-sm font-mono placeholder:text-[#525252] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <p className="text-xs text-[#a3a3a3] pb-3">
                Supports <code className="font-mono text-cyan-400/80">git log --oneline</code>, full format, or any git log variant.
              </p>
            </div>
          </div>

          {/* Git Log Textarea */}
          <div>
            <label className="block text-sm font-medium text-[#d4d4d4] mb-1.5">
              Git Log Output <span className="text-cyan-400 ml-1">*</span>
            </label>
            <textarea
              placeholder={PLACEHOLDER_LOG}
              value={gitLog}
              onChange={(e) => setGitLog(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 rounded-lg border border-[#262626] bg-[#141414] text-[#f5f5f5] text-sm font-mono leading-relaxed placeholder:text-[#525252] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors resize-y"
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-[#a3a3a3]">
                {gitLog.trim().split("\n").filter(Boolean).length} lines pasted
              </p>
              {gitLog.trim() && (
                <button
                  onClick={() => setGitLog("")}
                  className="text-xs text-[#a3a3a3] hover:text-red-400 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-10">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className={`relative px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 ${
              canGenerate && !loading
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-black hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                : "bg-[#262626] text-[#525252] cursor-not-allowed"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating Changelog...
              </span>
            ) : (
              "Generate Changelog"
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="border border-[#262626] bg-[#141414] rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse-dot" />
              <div
                className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse-dot"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse-dot"
                style={{ animationDelay: "0.4s" }}
              />
              <span className="text-sm text-[#a3a3a3] ml-2">
                Parsing commits and generating changelog...
              </span>
            </div>
            <div className="space-y-3">
              <div className="w-48 h-6 rounded animate-shimmer" />
              <div className="w-full h-4 rounded animate-shimmer" />
              <div className="w-4/5 h-4 rounded animate-shimmer" />
              <div className="w-36 h-6 rounded animate-shimmer mt-4" />
              <div className="w-3/4 h-4 rounded animate-shimmer" />
              <div className="w-2/3 h-4 rounded animate-shimmer" />
            </div>
          </div>
        )}

        {/* Results */}
        {changelog && stats && (
          <div className="animate-fade-in-up space-y-6">
            {/* Stats Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {stats.features > 0 && (
                <StatBadge
                  label="Features"
                  count={stats.features}
                  color="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                />
              )}
              {stats.fixes > 0 && (
                <StatBadge
                  label="Bug Fixes"
                  count={stats.fixes}
                  color="bg-amber-500/15 text-amber-400 border-amber-500/30"
                />
              )}
              {stats.breaking > 0 && (
                <StatBadge
                  label="Breaking"
                  count={stats.breaking}
                  color="bg-red-500/15 text-red-400 border-red-500/30"
                />
              )}
              {stats.other > 0 && (
                <StatBadge
                  label="Other"
                  count={stats.other}
                  color="bg-blue-500/15 text-blue-400 border-blue-500/30"
                />
              )}
            </div>

            {/* Changelog Output */}
            <div className="border border-[#262626] bg-[#141414] rounded-xl overflow-hidden">
              {/* Toolbar */}
              <div className="px-5 py-3 border-b border-[#262626] flex items-center justify-between">
                <span className="text-sm font-medium text-[#d4d4d4]">
                  Generated Changelog
                </span>
                <div className="flex items-center gap-2">
                  <CopyButton
                    label="Copy"
                    active={copied === "text"}
                    onClick={() => handleCopy("text")}
                  />
                  <CopyButton
                    label="Copy as Markdown"
                    active={copied === "md"}
                    onClick={() => handleCopy("md")}
                  />
                </div>
              </div>

              {/* Rendered Markdown */}
              <div className="px-6 py-5">
                <ChangelogRenderer markdown={changelog} />
              </div>
            </div>

            {/* Raw Markdown Toggle */}
            <details className="group">
              <summary className="text-sm text-[#a3a3a3] hover:text-[#f5f5f5] cursor-pointer transition-colors select-none">
                View raw markdown
              </summary>
              <pre className="mt-3 p-4 rounded-lg border border-[#262626] bg-[#0a0a0a] text-sm font-mono text-[#d4d4d4] whitespace-pre-wrap overflow-x-auto">
                {changelog}
              </pre>
            </details>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-[#a3a3a3]">
          Built with Groq + Llama 3.3 &middot; Changelogs are AI-generated
          &mdash; always review before publishing
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatBadge({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${color}`}
    >
      <span className="font-bold">{count}</span>
      {label}
    </span>
  );
}

function CopyButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#262626] bg-[#0a0a0a] text-[#a3a3a3] hover:text-[#f5f5f5] hover:border-[#404040] transition-all cursor-pointer"
    >
      {active ? (
        <>
          <svg
            className="w-3.5 h-3.5 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

function ChangelogRenderer({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // H1: # Changelog
        if (line.startsWith("# ")) {
          return (
            <h1
              key={i}
              className="text-2xl font-bold text-[#f5f5f5] mb-2 pb-2 border-b border-[#262626]"
            >
              {line.replace(/^# /, "")}
            </h1>
          );
        }
        // H2: ## [version] - date
        if (line.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="text-xl font-semibold text-cyan-400 mt-4 mb-2"
            >
              {line.replace(/^## /, "")}
            </h2>
          );
        }
        // H3: ### Features, ### Bug Fixes, etc.
        if (line.startsWith("### ")) {
          const section = line.replace(/^### /, "");
          const sectionColor = getSectionColor(section);
          return (
            <h3
              key={i}
              className={`text-base font-semibold mt-4 mb-1 ${sectionColor}`}
            >
              {section}
            </h3>
          );
        }
        // List item: - Something
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 pl-2 py-0.5">
              <span className="text-[#525252] select-none mt-0.5">-</span>
              <span className="text-sm text-[#d4d4d4] leading-relaxed">
                {line.replace(/^- /, "")}
              </span>
            </div>
          );
        }
        // Empty line
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        // Fallback
        return (
          <p key={i} className="text-sm text-[#a3a3a3]">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function getSectionColor(section: string): string {
  const lower = section.toLowerCase();
  if (lower.includes("feature") || lower.includes("added"))
    return "text-emerald-400";
  if (lower.includes("fix")) return "text-amber-400";
  if (lower.includes("breaking")) return "text-red-400";
  if (lower.includes("improvement") || lower.includes("changed"))
    return "text-blue-400";
  if (lower.includes("doc")) return "text-purple-400";
  if (lower.includes("chore") || lower.includes("maintenance"))
    return "text-[#a3a3a3]";
  return "text-[#d4d4d4]";
}
