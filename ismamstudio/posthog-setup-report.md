<wizard-report>
# PostHog post-wizard report

The wizard has completed a full PostHog integration for Ismam Studio — an AI-powered KDP book generator. Client-side analytics are initialized via `instrumentation-client.ts` (the Next.js 15.3+ approach), routed through a reverse proxy in `next.config.js` to avoid ad blockers. A shared server-side PostHog client (`src/lib/posthog-server.ts`) instruments the AI generation API route and AppSumo webhook handlers. Ten events cover the entire user journey: from book outline generation through PDF export, pricing checkout, and AppSumo lifetime deal redemption.

| Event | Description | File |
|-------|-------------|------|
| `book_outline_generation_started` | User submits the generate form to start an AI book outline | `src/app/generate/GenerateClient.tsx` |
| `book_outline_generated` | AI book outline completed and saved to the database | `src/app/generate/GenerateClient.tsx` |
| `upgrade_plan_clicked` | User clicks upgrade from the generation limit warning banner | `src/app/generate/GenerateClient.tsx` |
| `book_exported_pdf` | User exports a book as a PDF from the book reader | `src/components/ExportButton.tsx` |
| `checkout_initiated` | User clicks a pricing plan checkout button (Paddle) | `src/components/PricingSection.tsx` |
| `appsumo_code_redeemed` | User successfully redeems an AppSumo lifetime deal code | `src/app/redeem/RedeemPageInner.tsx` |
| `book_title_edited` | User saves an edited book title and subtitle | `src/app/book/[id]/BookReader.tsx` |
| `server_book_outline_requested` | Server-side: AI outline generation API called by authenticated user | `src/app/api/generate/route.ts` |
| `server_appsumo_license_deactivated` | Server-side: AppSumo deactivate/refund webhook received | `src/app/api/appsumo/webhook/route.ts` |
| `server_appsumo_license_activated` | Server-side: AppSumo purchase/activate webhook received | `src/app/api/appsumo/webhook/route.ts` |

## Next steps

We've built a dashboard and five insights for you to monitor user behaviour:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/510509/dashboard/1841587)
- [Book generation funnel (wizard)](https://us.posthog.com/project/510509/insights/DdsVcYYT)
- [Book outlines generated over time (wizard)](https://us.posthog.com/project/510509/insights/QQstQroq)
- [PDF exports over time (wizard)](https://us.posthog.com/project/510509/insights/hv5HGpCk)
- [Checkout initiated by plan (wizard)](https://us.posthog.com/project/510509/insights/EcKN7uc3)
- [AppSumo lifetime deals redeemed (wizard)](https://us.posthog.com/project/510509/insights/HCGovRNI)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any onboarding scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify in PostHog Error Tracking.
- [ ] Confirm the returning-visitor path also calls `identify` — currently identification only happens on AppSumo redemption success. If Clerk provides the user ID on load, add a `posthog.identify(userId)` call in a top-level layout or auth hook so returning sessions are linked to the correct person from the first pageview.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
