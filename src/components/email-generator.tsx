"use client";

import { useEffect, useMemo, useState } from "react";
import { buildApiUrl } from "@/lib/api";
import { ConfirmationModal } from "@/components/confirmation-modal";

const toneOptions = [
  {
    value: "Professional",
    label: "Professional",
    description: "Polished, concise, and business-ready",
  },
  {
    value: "Friendly",
    label: "Friendly",
    description: "Warm, clear, and approachable",
  },
  {
    value: "Formal",
    label: "Formal",
    description: "Respectful and more traditional",
  },
  {
    value: "Casual",
    label: "Casual",
    description: "Relaxed, human, and direct",
  },
] as const;

const examplePrompts = [
  "Write a follow-up email after an interview for a product designer role.",
  "Generate a leave request email for two days off next week due to a family event.",
  "Write a cold outreach email for a SaaS product that helps sales teams automate notes.",
] as const;

type Tone = (typeof toneOptions)[number]["value"];

type EmailResponse = {
  id: number;
  subject: string;
  body: string;
  tone: Tone;
  prompt: string;
  generatedAt: string;
  model: string;
};

type HistoryItem = EmailResponse;
type Toast = {
  message: string;
  type: "success" | "error" | "info";
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EmailGenerator() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [result, setResult] = useState<EmailResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");
  const [historyStatus, setHistoryStatus] = useState("Loading history...");
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [copied, setCopied] = useState<"" | "email" | "body">("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const HISTORY_ITEMS_PER_PAGE = 3;

  useEffect(() => {
    void loadHistory();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const selectedTone = useMemo(
    () => toneOptions.find((option) => option.value === tone),
    [tone],
  );

  // Reset to page 1 when search query changes
  useEffect(() => {
    setHistoryCurrentPage(1);
  }, [historySearchQuery]);

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!historySearchQuery.trim()) {
      return history;
    }
    const query = historySearchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.prompt.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.tone.toLowerCase().includes(query),
    );
  }, [history, historySearchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredHistory.length / HISTORY_ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    const startIndex = (historyCurrentPage - 1) * HISTORY_ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, startIndex + HISTORY_ITEMS_PER_PAGE);
  }, [filteredHistory, historyCurrentPage]);

  function showToast(message: string, type: Toast["type"]) {
    setToast({ message, type });
  }

  async function loadHistory() {
    try {
      const response = await fetch(buildApiUrl("/api/v1/emails/history"));
      const payload = (await response.json()) as
        | HistoryItem[]
        | {
            error: string;
          };

      if (!response.ok || !Array.isArray(payload)) {
        throw new Error(
          Array.isArray(payload)
            ? "Unable to load email history."
            : payload.error ?? "Unable to load email history.",
        );
      }

      setHistory(payload);
      setHistoryStatus(
        payload.length
          ? ""
          : "Generated emails stored in the backend database will appear here.",
      );
    } catch (caughtError) {
      setHistory([]);
      setHistoryStatus(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to connect to the backend history service.",
      );
    }
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopied("");

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Add a prompt or topic so the model knows what kind of email to write.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(buildApiUrl("/api/v1/emails/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          tone,
        }),
      });

      const payload = (await response.json()) as
        | EmailResponse
        | {
            error: string;
          };

      if (!response.ok || "error" in payload) {
        throw new Error(
          "error" in payload
            ? payload.error
            : "We could not generate an email right now. Please try again.",
        );
      }

      setResult(payload);
      setHistory((currentHistory) => [payload, ...currentHistory].slice(0, 10));
      setHistoryStatus("");
      showToast("Email generated scroll down to see the response.", "success");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while contacting the AI service.";

      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy(mode: "email" | "body") {
    if (!result) {
      return;
    }

    const emailText =
      mode === "email"
        ? `Subject: ${result.subject}\n\n${result.body}`
        : result.body;

    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(mode);
      showToast(
        mode === "email" ? "Full email copied." : "Email body copied.",
        "info",
      );

      window.setTimeout(() => {
        setCopied("");
      }, 1600);
    } catch {
      // Fallback for non-secure contexts (HTTP) or when clipboard API fails
      try {
        const textArea = document.createElement("textarea");
        textArea.value = emailText;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setCopied(mode);
          showToast(
            mode === "email" ? "Full email copied." : "Email body copied.",
            "info",
          );
          window.setTimeout(() => {
            setCopied("");
          }, 1600);
        } else {
          showToast("Failed to copy. Please select and copy manually.", "error");
        }
      } catch {
        showToast("Failed to copy. Please select and copy manually.", "error");
      }
    }
  }

  async function handleClearHistory() {
    setIsClearing(true);

    try {
      const response = await fetch(buildApiUrl("/api/v1/emails/history"), {
        method: "DELETE",
      });

      const payload = (await response.json()) as
        | {
            success: boolean;
          }
        | {
            error: string;
          };

      if (!response.ok || ("error" in payload && payload.error)) {
        throw new Error(
          "error" in payload ? payload.error : "Unable to clear history.",
        );
      }

      setHistory([]);
      setHistoryStatus(
        "Generated emails stored in the backend database will appear here.",
      );
      showToast("Saved email history cleared.", "success");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to clear backend history.";

      setError(message);
      showToast(message, "error");
    } finally {
      setIsClearing(false);
    }
  }

  function loadHistoryItem(item: HistoryItem) {
    setPrompt(item.prompt);
    setTone(item.tone);
    setResult(item);
    setError("");
    setCopied("");
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 max-w-sm">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : toast.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-slate-200 bg-white/95 text-slate-800"
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <section className="glass-panel overflow-hidden rounded-[2rem]">
        <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-[rgba(122,47,21,0.12)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-deep)]">
                Humanly
              </span>
              <span className="text-sm text-[var(--muted)]">
                AI Email Generator
              </span>
            </div>

            <div className="space-y-4">
              <p className="font-display text-5xl leading-none text-slate-900 sm:text-6xl">
                Write sharper emails from a single idea.
              </p>
              <p className="max-w-2xl text-balance text-base leading-7 text-[var(--muted)] sm:text-lg">
                Turn a rough prompt into a polished subject line and full email
                body with the tone you need, from interview follow-ups to cold
                outreach.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {examplePrompts.map((examplePrompt) => (
                <button
                  key={examplePrompt}
                  type="button"
                  onClick={() => setPrompt(examplePrompt)}
                  className="rounded-[1.5rem] border border-[rgba(31,41,55,0.08)] bg-white/70 px-4 py-4 text-left text-sm leading-6 text-slate-700 transition hover:-translate-y-0.5 hover:border-[rgba(188,92,52,0.28)] hover:bg-white"
                >
                      {examplePrompt}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleGenerate}
            className="paper-panel rounded-[1.75rem] p-5 sm:p-6"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="prompt"
                  className="text-sm font-semibold text-slate-800"
                >
                  Prompt or topic
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Example: Write a follow-up email after an interview for a frontend engineer role."
                  className="min-h-44 w-full rounded-[1.25rem] border border-[rgba(31,41,55,0.12)] bg-white px-4 py-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[rgba(188,92,52,0.45)] focus:ring-4 focus:ring-[rgba(188,92,52,0.12)]"
                />
                <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Be specific about context, audience, and goal.</span>
                  <span>{prompt.trim().length} chars</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="tone"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Tone
                  </label>
                  <span className="text-xs text-[var(--muted)]">
                    {selectedTone?.description}
                  </span>
                </div>
                <select
                  id="tone"
                  value={tone}
                  onChange={(event) => setTone(event.target.value as Tone)}
                  className="w-full rounded-[1rem] border border-[rgba(31,41,55,0.12)] bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[rgba(188,92,52,0.45)] focus:ring-4 focus:ring-[rgba(188,92,52,0.12)]"
                >
                  {toneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {error ? (
                <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer inline-flex flex-1 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Generating email..." : "Generate Email"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrompt("");
                    setResult(null);
                    setError("");
                    setCopied("");
                    showToast("Form cleared.", "info");
                  }}
                  className="cursor-pointer inline-flex items-center justify-center rounded-full border border-[rgba(31,41,55,0.12)] px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="paper-panel rounded-[2rem] p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 border-b border-[rgba(31,41,55,0.08)] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                Generated Email
              </p>
              <h2 className="mt-2 font-display text-3xl text-slate-900">
                Subject and email copy
              </h2>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!result}
                onClick={() => void handleCopy("email")}
                className="cursor-pointer rounded-full border border-[rgba(31,41,55,0.12)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {copied === "email" ? "Copied full email" : "Copy email"}
              </button>
              <button
                type="button"
                disabled={!result}
                onClick={() => void handleCopy("body")}
                className="cursor-pointer rounded-full border border-[rgba(31,41,55,0.12)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {copied === "body" ? "Copied body" : "Copy body"}
              </button>
              <button
                type="button"
                disabled={!result}
                onClick={() => {
                  setResult(null);
                  setCopied("");
                  showToast("Generated email cleared.", "info");
                }}
                className="cursor-pointer rounded-full border border-[rgba(31,41,55,0.12)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                Clear
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 py-6">
              <div className="h-6 w-40 animate-pulse rounded-full bg-[rgba(31,41,55,0.08)]" />
              <div className="h-14 animate-pulse rounded-3xl bg-[rgba(31,41,55,0.06)]" />
              <div className="space-y-3 rounded-[1.5rem] bg-[rgba(255,255,255,0.7)] p-5">
                <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(31,41,55,0.08)]" />
                <div className="h-4 w-[92%] animate-pulse rounded-full bg-[rgba(31,41,55,0.08)]" />
                <div className="h-4 w-[88%] animate-pulse rounded-full bg-[rgba(31,41,55,0.08)]" />
                <div className="h-4 w-[76%] animate-pulse rounded-full bg-[rgba(31,41,55,0.08)]" />
              </div>
            </div>
          ) : result ? (
            <div className="space-y-5 py-6">
              <div className="rounded-[1.5rem] border border-[rgba(31,41,55,0.08)] bg-white/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Subject
                </p>
                <p className="mt-3 text-xl font-semibold text-slate-900">
                  {result.subject}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[rgba(31,41,55,0.08)] bg-white/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Body
                </p>
                <div className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                  {result.body}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                <span className="rounded-full bg-white/70 px-3 py-1.5">
                  Tone: {result.tone}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1.5">
                  Generated: {formatDate(result.generatedAt)}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1.5">
                  Model: {result.model}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[rgba(31,41,55,0.12)] bg-white/40 px-6 py-10 text-center">
              <p className="font-display text-4xl text-slate-900">
                Your draft appears here
              </p>
              <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">
                Choose a tone, describe the email you need, and the generated
                subject line plus full email copy will show up here.
              </p>
            </div>
          )}
        </article>

        <aside className="paper-panel rounded-[2rem] p-5 sm:p-6 lg:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-[rgba(31,41,55,0.08)] pb-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                Recent History
              </p>
              <h2 className="mt-2 font-display text-3xl text-slate-900">
                Reuse your strongest prompts
              </h2>
            </div>

            {history.length ? (
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(true)}
                disabled={isClearing}
                className="cursor-pointer rounded-full border border-[rgba(31,41,55,0.12)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isClearing ? "Clearing..." : "Clear all"}
              </button>
            ) : null}
          </div>

          {/* Search Input */}
          {history.length ? (
            <div className="mt-5">
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Search by prompt, subject, or tone..."
                className="w-full rounded-2xl border border-[rgba(31,41,55,0.12)] bg-white/70 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[rgba(188,92,52,0.45)] focus:ring-4 focus:ring-[rgba(188,92,52,0.12)]"
              />
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            {paginatedHistory.length ? (
              paginatedHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => loadHistoryItem(item)}
                  className="cursor-pointer w-full rounded-[1.5rem] border border-[rgba(31,41,55,0.08)] bg-white/65 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[rgba(188,92,52,0.12)] px-3 py-1 text-xs font-semibold text-[var(--accent-deep)]">
                      {item.tone}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {formatDate(item.generatedAt)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">
                    {item.prompt}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {item.subject}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[rgba(31,41,55,0.12)] bg-white/40 px-5 py-8 text-sm leading-7 text-[var(--muted)]">
                {historyStatus}
              </div>
            )}

          {/* Pagination Controls */}
          {totalPages > 1 && paginatedHistory.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setHistoryCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={historyCurrentPage === 1}
                className="cursor-pointer rounded-full border border-[rgba(31,41,55,0.12)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setHistoryCurrentPage(page)}
                    className={`cursor-pointer rounded-full px-3 py-2 text-sm font-semibold transition ${
                      historyCurrentPage === page
                        ? "bg-(--accent) text-white"
                        : "border border-[rgba(31,41,55,0.12)] text-slate-700 hover:bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setHistoryCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={historyCurrentPage === totalPages}
                className="cursor-pointer rounded-full border border-[rgba(31,41,55,0.12)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          </div>
        </aside>
      </section>

      <ConfirmationModal
        isOpen={showClearConfirmModal}
        title="Clear All History"
        message="All Generated Response will be cleared"
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={() => {
          setShowClearConfirmModal(false);
          void handleClearHistory();
        }}
        onCancel={() => setShowClearConfirmModal(false)}
      />
    </main>
  );
}
