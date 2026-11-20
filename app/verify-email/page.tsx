"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiError, verifyEmail, revokeEmailVerification } from "@/src/lib/api";

type VerificationState =
  | "confirm"
  | "verifying"
  | "revoking"
  | "success"
  | "cancelled"
  | "expired"
  | "used"
  | "revoked"
  | "invalid"
  | "error";

type IconKind = "mail" | "spinner" | "check" | "cancel" | "warning";

const btnBase =
  "flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card disabled:cursor-not-allowed disabled:opacity-60";
const btnPrimary = `${btnBase} bg-primary text-primary-foreground hover:bg-primary/90`;
const btnOutline = `${btnBase} border border-border bg-background text-foreground hover:bg-secondary`;

const ICON_FOR_STATE: Record<VerificationState, IconKind> = {
  confirm: "mail",
  verifying: "spinner",
  revoking: "spinner",
  success: "check",
  cancelled: "cancel",
  used: "check",
  expired: "warning",
  revoked: "warning",
  invalid: "warning",
  error: "warning",
};

const DESTRUCTIVE_STATES: VerificationState[] = [
  "expired",
  "revoked",
  "invalid",
  "error",
];
const POSITIVE_STATES: VerificationState[] = ["success", "cancelled", "used"];

function StatusIcon({ kind }: { kind: IconKind }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  } as const;
  const stroke = {
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  switch (kind) {
    case "spinner":
      return (
        <svg
          {...common}
          className="h-9 w-9 text-primary motion-safe:animate-spin"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.2"
          />
          <path d="M21 12a9 9 0 0 0-9-9" {...stroke} strokeWidth="3" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} className="h-9 w-9 text-primary">
          <path d="m5 12 4 4L19 6" {...stroke} strokeWidth="2.5" />
        </svg>
      );
    case "cancel":
      return (
        <svg {...common} className="h-9 w-9 text-primary">
          <circle cx="12" cy="12" r="9" {...stroke} strokeWidth="2" />
          <path d="m8.5 8.5 7 7m0-7-7 7" {...stroke} strokeWidth="2" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common} className="h-9 w-9 text-destructive">
          <path
            d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z"
            {...stroke}
            strokeWidth="2"
          />
        </svg>
      );
    default:
      return (
        <svg {...common} className="h-9 w-9 text-primary">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="m3 7 9 6 9-6" {...stroke} strokeWidth="2" />
        </svg>
      );
  }
}

/** Turns any thrown error into the right screen + message. */
function resolveError(error: unknown): {
  state: VerificationState;
  message: string;
} {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "TOKEN_EXPIRED":
        return { state: "expired", message: error.message };
      case "TOKEN_USED":
      case "ALREADY_VERIFIED":
        return { state: "used", message: error.message };
      case "TOKEN_REVOKED":
        return { state: "revoked", message: error.message };
      case "TOKEN_REQUIRED":
      case "INVALID_TOKEN":
        return { state: "invalid", message: error.message };
    }
    // Fallback for servers that don't send a code yet
    if (error.status === 410) {
      return { state: "expired", message: error.message };
    }
  }

  return {
    state: "error",
    message:
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.",
  };
}

function getContent(state: VerificationState, errorMessage: string) {
  switch (state) {
    case "confirm":
      return {
        title: "Verify your email",
        description:
          "We received a request to verify this email address for your Tractor Khata account. Please confirm whether you made this request.",
      };
    case "verifying":
      return {
        title: "Verifying your email…",
        description: "Please wait while we securely verify your email address.",
      };
    case "revoking":
      return {
        title: "Cancelling verification…",
        description: "We’re securely cancelling this verification request.",
      };
    case "success":
      return {
        title: "Email verified!",
        description:
          "Your email address has been verified. You can now return to Tractor Khata.",
      };
    case "cancelled":
      return {
        title: "No changes made",
        description:
          "This request has been cancelled. Your email address has not been verified and your account remains unchanged.",
        hint: {
          heading: "Your account has not been changed.",
          text: "You can safely close this browser tab.",
        },
      };
    case "expired":
      return {
        title: "Link expired",
        description:
          "This verification link has expired. For your security, links are only valid for a limited time.",
        hint: {
          heading: "Need another verification link?",
          text: "Open Tractor Khata and request a new verification email.",
        },
      };
    case "used":
      return {
        title: "Link already used",
        description:
          errorMessage || "This verification link has already been used.",
        hint: {
          heading: "Nothing more to do here.",
          text: "If your email is verified, you can return to the app.",
        },
      };
    case "revoked":
      return {
        title: "Request cancelled",
        description:
          "This verification request was cancelled, so the link no longer works.",
        hint: {
          heading: "Want to verify this email?",
          text: "Open Tractor Khata and request a new verification email.",
        },
      };
    case "invalid":
      return {
        title: "Invalid link",
        description:
          "This verification link isn’t valid. It may be incomplete or copied incorrectly.",
        hint: {
          heading: "Try the link from your email again.",
          text: "Or request a new verification email from the Tractor Khata app.",
        },
      };
    default:
      return {
        title: "Something went wrong",
        description:
          errorMessage ||
          "We couldn’t complete your request. Please try again.",
      };
  }
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerificationState>(
    token ? "confirm" : "invalid",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const run = async (
    action: (token: string) => Promise<unknown>,
    pending: VerificationState,
    done: VerificationState,
  ) => {
    if (!token) {
      setState("invalid");
      return;
    }

    setState(pending);
    setErrorMessage("");

    try {
      await action(token);
      setState(done);
    } catch (error) {
      const result = resolveError(error);
      setErrorMessage(result.message);
      setState(result.state);
    }
  };

  const handleVerify = () => run(verifyEmail, "verifying", "success");
  const handleRevoke = () =>
    run(revokeEmailVerification, "revoking", "cancelled");

  const handleOpenApp = () => {
    const scheme = process.env.NEXT_PUBLIC_APP_SCHEME || "tractor-khata";
    window.location.href = `${scheme}://`;
  };

  const handleRetry = () => {
    setErrorMessage("");
    setState("confirm");
  };

  const content = getContent(state, errorMessage);
  const isLoading = state === "verifying" || state === "revoking";

  const iconBg = POSITIVE_STATES.includes(state)
    ? "bg-primary/10"
    : DESTRUCTIVE_STATES.includes(state)
      ? "bg-destructive/10"
      : "bg-secondary";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 text-card-foreground shadow-sm sm:p-8">
        <div className="mb-6 flex justify-center">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full ${iconBg}`}
          >
            <StatusIcon kind={ICON_FOR_STATE[state]} />
          </div>
        </div>

        <div className="text-center" role="status" aria-live="polite">
          <h1 className="text-xl font-bold tracking-tight">{content.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {content.description}
          </p>
        </div>

        {state === "confirm" && (
          <div className="mt-8 space-y-3">
            <button type="button" onClick={handleVerify} className={btnPrimary}>
              Yes, it’s me
            </button>
            <button type="button" onClick={handleRevoke} className={btnOutline}>
              No, it’s not me
            </button>
          </div>
        )}

        {isLoading && (
          <div className="mt-8 rounded-xl bg-secondary/60 px-4 py-3 text-center text-sm text-muted-foreground">
            {state === "verifying"
              ? "Please don’t close this page…"
              : "Cancelling your verification request…"}
          </div>
        )}

        {(state === "success" || state === "used") && (
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleOpenApp}
              className={btnPrimary}
            >
              Open Tractor Khata
              <svg
                className="ml-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 17 17 7M8 7h9v9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {state === "success" && (
              <p className="text-center text-xs text-muted-foreground">
                If the app doesn’t open, switch back to it manually.
              </p>
            )}
          </div>
        )}

        {"hint" in content && content.hint && (
          <div className="mt-8 rounded-xl border border-border bg-secondary/50 p-4 text-center">
            <p className="text-sm font-medium">{content.hint.heading}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {content.hint.text}
            </p>
          </div>
        )}

        {/* Only generic/network errors are worth retrying */}
        {state === "error" && token && (
          <div className="mt-8">
            <button type="button" onClick={handleRetry} className={btnPrimary}>
              Try again
            </button>
          </div>
        )}

        {state === "confirm" && (
          <div className="mt-8 border-t border-border pt-5 text-center">
            <p className="text-xs leading-5 text-muted-foreground">
              If you didn’t request this verification, you can safely cancel it.
              Your account security is important to us.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-9 w-9 rounded-full border-4 border-primary/20 border-t-primary motion-safe:animate-spin" />
        <p className="text-sm text-muted-foreground">Loading verification…</p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
