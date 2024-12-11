import * as Sentry from "@sentry/bun";

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: process.env.SENTRY_KEY,

  // Add Performance Monitoring by setting tracesSampleRate
  // Set tracesSampleRate to 1.0 to capture 100% of transactions
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
});