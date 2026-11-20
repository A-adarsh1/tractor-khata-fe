const steps = [
  {
    title: "Open your email",
    body: "Find the message from Tractor Khata in your inbox. Check your spam folder if you don’t see it.",
  },
  {
    title: "Tap the verification link",
    body: "The link opens this page and takes you to a short confirmation screen.",
  },
  {
    title: "Confirm it’s you",
    body: "Approve the request, then head back to the app to continue.",
  },
];

export default function HomePage() {
  const scheme = process.env.NEXT_PUBLIC_APP_SCHEME || "tractor-khata";

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-14 sm:px-6 sm:py-20">
      <div className="w-full max-w-xl">
        <div className="text-center">
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary text-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-10 w-10"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path
                d="m4 7 8 6 8-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">
            Welcome
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Verify your email address
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
            This portal helps you securely confirm your email and activate your
            Tractor Khata account.
          </p>
        </div>

        <ol className="mt-10 space-y-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <h2 className="font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-secondary/60 p-4 text-sm text-secondary-foreground">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-3Z"
              strokeLinejoin="round"
            />
            <path
              d="m9 12 2 2 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="leading-6">
            We’ll never ask for your password on this page. Verification links
            are single-use and expire automatically.
          </p>
        </div>

        <div className="mt-8 text-center">
          <a
            href={`${scheme}://`}
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            Open Tractor Khata app
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            Already have your email? Just open the link inside it.
          </p>
        </div>
      </div>
    </main>
  );
}
