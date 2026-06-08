# BrainPower AI Investor Portal — A-to-Z Specification

**Scope:** Public marketing site — **Front Page (`/`)** and **Investors Page (`/investors`)**.
**Product:** BrainPower AI — "The Operating System for Decisions."
**Domains:** brainpowerai.com / brainpowerinvestor.com
**Document type:** Comprehensive design, UX/UI, interaction, accessibility, responsive, and functional reference.

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24, single Express 5 server |
| Frontend | React 19, Vite, TypeScript 5.9 |
| Routing | `wouter` (client-side SPA routing) |
| API transport | tRPC (`/api/trpc`) over `httpBatchLink` + `superjson` |
| Data fetching/cache | TanStack React Query |
| Auth | Supabase (client-side sign-in) + Forge/Manus OAuth (server-side) |
| Database | PostgreSQL (Neon) via Drizzle ORM (`pg`) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`), `tw-animate-css` |
| UI primitives | shadcn/ui on Radix UI |
| Animation | `framer-motion` + custom Canvas 2D |
| Icons | `lucide-react` |
| Toasts | `sonner` |
| Monorepo | pnpm workspace, artifact `artifacts/portal` |

**Rendering model:** Client-side rendered SPA. The server additionally injects per-route static HTML snapshots (crawler/SEO content) and route metadata. There is no React hydration of those snapshots — React mounts fresh via `createRoot`.

---

## 2. Design System

### 2.1 Color Tokens

The marketing pages use a **hardcoded dark brand palette** (inline styles + Tailwind arbitrary values), independent of the shadcn theme variables. The shadcn theme tokens (Section 2.2) drive the imported UI primitives.

**Brand palette (marketing surfaces):**

| Token / Role | Hex | Usage |
|---|---|---|
| Primary background | `#0a0b1e` | Page background (Home + Investors root), first-paint color |
| Section background (darker) | `#07081a` | Alternating sections, form inputs |
| Card / dialog surface | `#0d0e24` | Dialogs, cards |
| Cyan accent | `#00d4ff` | Primary accent, gradients, links, stats, glows |
| Cyan deep | `#0099bb` | Gradient end for cyan CTA |
| Purple accent | `#b24bf3` | Secondary accent, gradients, investor CTA |
| Purple deep | `#7c3aed` | Gradient end for purple CTA |
| Lavender | `#c084fc` | Hero supporting copy |
| Sky hover | `#7dd3fc` | Hub link hover |
| Text primary | `#ffffff` | Headings, key copy |
| Text muted | `gray-300 / gray-400 / gray-500` | Body, captions, footer |

**Signature gradient:** `linear-gradient(135deg, #00d4ff 0%, #b24bf3 100%)` — applied as text clip on headings and as button backgrounds. A tri-stop variant `#00d4ff → white → #b24bf3` is used on select Investors headings.

**Glow system (box/drop shadows):**
- Cyan glow: `0 0 20px rgba(0,212,255,0.4)` (buttons), `0 0 40px rgba(0,212,255,0.15)` (video frame).
- Purple glow: `0 0 20px rgba(178,75,243,0.4)`.
- Text shadow on stats: `0 0 20px rgba(0,212,255,0.5), 0 0 40px rgba(0,212,255,0.3)`.

### 2.2 shadcn Theme Tokens (UI primitives)

Defined in `client/src/index.css` via `@theme inline` mapping `--color-*` → CSS variables. Two themes exist: `:root` (light, the default) and `.dark`. Values are **OKLCH**. Primary is blue (`--color-blue-700`). The marketing pages do not toggle `.dark`; the `ThemeProvider` defaults to `light` and is non-switchable, so imported primitives render in light-token mode unless overridden by inline brand styling (which the pages do extensively).

- `--radius: 0.65rem`; derived `--radius-sm/md/lg/xl` via `calc()`.
- Charts: `--chart-1..5` mapped to blue 300→800.

### 2.3 Typography

- **Font family:** Tailwind v4 default sans stack (`ui-sans-serif, system-ui, sans-serif, …`). **No custom web font is loaded** — typography is system-native for performance.
- **Weight usage:** `font-bold` (headings, stats, CTAs), `font-semibold` (sub-headings, labels), `font-medium` (table labels), normal (body).
- **Tracking:** `tracking-tighter` on hero headings; `tracking-widest uppercase` on eyebrow labels.

**Type scale (responsive):**

| Role | Classes |
|---|---|
| Hero H1 (Home) | `text-4xl md:text-6xl` |
| Hero H1 (Investors) | `text-5xl md:text-7xl` |
| Section H2 | `text-3xl md:text-4xl` / `text-4xl md:text-5xl` / `sm:text-5xl` |
| Big stat number | `text-5xl md:text-7xl` |
| Card title | `text-xl` / `text-2xl` |
| Lead paragraph | `text-xl md:text-2xl` |
| Body | `text-base` / `text-lg` |
| Caption / eyebrow | `text-xs` / `text-sm`, `uppercase tracking-widest` |

### 2.4 Spacing, Layout & Radius

- **Container utility** (`.container`, custom): centered, responsive padding **16px → 24px (≥640) → 32px (≥1024)**, `max-width: 1280px` at ≥1024px.
- **Section rhythm:** vertical padding `py-12` / `py-16` / `py-24`.
- **Corner radius:** `rounded-lg`/`xl`/`2xl`/`3xl` on cards, dialogs, media frames; pills via `rounded-full`.
- **Borders:** hairline `rgba(255,255,255,0.1–0.35)` for dividers/cards on dark surfaces.

### 2.5 Iconography & Media

- **Icons:** `lucide-react` — e.g. `ArrowRight, Briefcase, Lock, Loader2, Rocket, Award`.
- **Media (Home):** CloudFront-hosted hero images (robot, neural head, app screenshots), a product demo **MP4** (CloudFront), concept thumbnails (imgur). All `<img>` carry descriptive `alt`; below-fold images use `loading="lazy" decoding="async"`.
- **Decorative canvas:** full-viewport animated neural network behind Home.

---

## 3. Responsive System

- **Breakpoints (Tailwind defaults):** `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`, `2xl 1536px`.
- **Patterns:**
  - Grids: `grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4` (concepts); `grid-cols-2 → md:grid-cols-4` (metrics); `md:grid-cols-2/3` (investor cards/stats).
  - Flex direction: `flex-col → sm:flex-row` (CTA groups), `flex-col → md:flex-row`.
  - Fluid sizing via `clamp()` for hero image widths/heights.
  - Hero side phone images hidden on mobile (`hidden sm:flex`).
  - Type and spacing scale up at `md`.

---

## 4. Motion & Animation System

**Library:** `framer-motion`, plus a bespoke Canvas animation and a spring number counter.

| Pattern | Definition | Where |
|---|---|---|
| Hero entrance | `initial={{opacity:0,y:-30}} → animate` with staggered `delay` (0.3–0.6s) | Home hero h1/p/CTAs |
| Scroll reveal | `whileInView={{opacity:1,y:0}}`, `viewport={{once:true}}`, `~0.5–0.8s` | Both pages, section content |
| Stagger container | `staggerContainer` variant → `staggerChildren: 0.1` | Investors grids |
| Fade-in-up | `fadeInUp` variant: `y:20, opacity:0 → y:0, opacity:1` | Investors items |
| Card hover | `whileHover={{ scale: 1.02, y: -5 }}`; CSS `hover:-translate-y-2` | Investor/concept cards |
| Count-up stat | `useSpring(0,{damping:100,stiffness:100,mass:3})`, fires on `useInView({once})` | Home metrics (`AnimatedNumber`) |
| Neural canvas | `requestAnimationFrame` particle field: 250 nodes, link distance 220px, flow speed 0.3, pulsing cyan links `rgba(0,200,255,…)`, blinking nodes; `position:fixed`, `opacity:0.7`, `pointer-events:none`, `z-index:0` | Home background |
| Video hover-play | `onMouseEnter` unmutes+plays, `onMouseLeave` pauses+resets+mutes | Home App Preview |

**Gap:** No `prefers-reduced-motion` handling — continuous canvas animation and reveals run regardless of OS motion settings (see §11 Accessibility).

---

## 5. Component Inventory

**shadcn/ui (Radix) primitives in use on these pages:** `Button`, `Card` (`CardHeader/Title/Description/Content`), `Dialog` (`Trigger/Content/Header/Title/Description`), `Input`, `Label`, `Textarea`, `Badge`, `Accordion`, `Separator`. (Full library present in `components/ui/` — accordion, tabs, table, tooltip, sonner, etc.)

**Custom components:**
- `NeuralCanvas` — animated background (Home).
- `AnimatedNumber` — spring count-up stat (Home).
- `AdminLoginDialog` — modal Supabase login (Home footer).
- `ErrorBoundary` — global error fallback.
- `ProtectedRoute` — gated routes (dashboard).
- Shared: `AIChatBox`, `ManusDialog`, `DashboardLayout` (used elsewhere in app).

---

## 6. Global Shell, Routing & Navigation

- **Router:** `wouter` `<Switch>`. Public routes: `/` (Home, eager), `/investors` (Investors, eager). Lazy: `/login`, `/register`, `/forgot-password`, `/dashboard` (protected), `/admin`, `/concepts/:slug` (4 concept pages), `/book`, booking admin. `<Suspense fallback={null}>`.
- **Providers (App root):** `tRPC.Provider` → `QueryClientProvider` → (`ThemeProvider` light/non-switchable, `SupabaseAuthProvider`, `TooltipProvider`) → `ErrorBoundary`.
- **Global affordances:** "Back to SmarThinkerz Hub" fixed top-left link; `Toaster` (sonner) mounted globally.
- **No persistent top nav bar** on the marketing pages — navigation is via in-page CTAs, anchor links, and footers.
- **Auth handling:** unauthorized tRPC errors auto-redirect to the login URL (global query-cache subscriber).

---

## 7. Front Page (`/`) — Section-by-Section

**Meta:** title *"BrainPower AI — The Operating System for Decisions"*; description as set via `usePageMeta`. Root: `min-h-screen`, bg `#0a0b1e`, white text.

1. **Neural Canvas background** — fixed, decorative animated network (see §4).
2. **Hero** (`min-h-screen`, centered):
   - H1: gradient "BrainPower AI" + white "The Operating System for Decisions."
   - Tagline (cyan): "Structured Intelligence. Simulated Futures. Semi-3D Visual Decisions."
   - Hero image cluster: tilted app screenshots (hidden on mobile) flanking robot + neural-head images, with drop-shadow glows, `clamp()` sizing.
   - Glass subtitle card: positioning copy ("not a chatbot… structured intelligence system").
   - **"Why BrainPower AI?" comparison table** — 4 columns (blank / Traditional Analysis / Generative AI / BrainPower AI), 5 rows (Output, Analysis, Method, Visualization, Purpose), zebra striping, brightened borders + vertical dividers, BrainPower column highlighted cyan.
   - **CTA row:** "Explore Concepts" (cyan gradient → `#concepts` scroll), "For Investors" (purple gradient → `/investors`), "Admin Login" (outline → opens dialog). Fixed width `w-48`, stack on mobile.
3. **App Preview** — gradient H2 "See BrainPower AI in Action"; centered MP4 frame (max 800px) with cyan border/glow; **hover-to-play with sound**, overlay play button + "Hover to play" hint that fades on hover.
4. **BrainPower Advisory Board™** — eyebrow "Major Differentiator"; explains multi-lens decision pressure-testing (investment, strategy, innovation, operations, risk, technology, customer-impact).
5. **Interactive Metrics** — 4 animated count-up stats: Decision Clarity 87↑, Cognitive Load 42↓, Thinking Structure 3.2×, Outcomes Simulated 12. Grid `2 → md:4`, cyan glow numbers, descriptions.
6. **Concepts** (`#concepts`) — H2 "Conceptual Foundations"; 4 cards (Systemic Thinking, Cognitive Biases, Decision Intelligence, Mental Models) with lazy image, gradient overlay, hover lift + "Learn more →" reveal; each links to `/concepts/:slug`. Grid `1 → sm:2 → lg:4`.
7. **Footer** — copyright (dynamic year), links: Explore Concepts, For Investors, **Admin Login** (dialog), and "Part of the SmarThinkerz Unified Intelligence Hub" external link.

**AdminLoginDialog flow:** email + password (validated) → Supabase `signIn` → success toast → role lookup (`auth.getRoleByEmail`) → redirect `/admin` (admin roles) or `/dashboard` (others); loading spinner; error toast; "Forgot password?" link. Dialog uses brand-dark surface, gradient title.

---

## 8. Investors Page (`/investors`) — Section-by-Section

**Meta:** title *"Investor Relations — BrainPower AI"*; description set via `usePageMeta`. Root: `min-h-screen bg-[#0a0b1e] text-white`. Analytics: `trpc.investor.trackEvent` mutation fires on interactions.

1. **Hero** — Badge **"Founding Participation Round"** (Rocket icon); large gradient H1; positioning copy; CTAs "Explore Investment Tiers" (→ `#investment-tiers`) and "Download Brief" (PDF).
2. **The Opportunity in Numbers** — 3 stats: **20%** max economic participation pool, **$15M** target ARR in 5 years, **GCC & Global** market focus.
3. **From Information to Decisions** — numbered capability steps (Structuring, Simulation, Visualization, Tracking, Learning) with availability badges.
4. **A Multi-Layer Decision Intelligence System** / **8 Integrated Intelligence Engines** — product-architecture explainer cards.
5. **Compounding Intelligence Over Time** — neural feedback-loop narrative.
6. **Fundamentally Different from General AI** — category-definition copy with gradient emphasis and bordered callout box.
7. **Applicable Across Every Decision Context** — cross-domain use cases grid.
8. **Enterprise Market Expansion (use case)** — comparison tables: Traditional vs BrainPower; Without vs With (Challenge/Process/Outcome/Impact); Capability matrix (BrainPower vs ChatGPT vs Traditional Analysis).
9. **Core Differentiation** — 4 cards: A New Category, Structure Over Outputs, Cross-Domain Use Cases, Multi-Platform Expansion (hover lift).
10. **Investment Opportunity** (`#investment-tiers`):
    - Copy: *"Founding Participation Round — raising $1,000,000–$3,000,000 USD for up to 20% economic participation … targeting $15M ARR within 5 years."*
    - **5 bands (dual OMR/USD):**
      | Band | Name | Min | Instrument | Horizon |
      |---|---|---|---|---|
      | A | Community Supporter | $50,000 (OMR 19,256) | SAFE/Convertible | 24–48 mo |
      | B | Early Angel | $100,000 (OMR 38,513) | SAFE/Convertible | 24–36 mo |
      | C | Strategic Angel **(Most Popular)** | $250,000 (OMR 96,283) | SAFE/Equity | 18–36 mo |
      | D | Enterprise Partner | $500,000 (OMR 192,566) | SAFE/Equity | 18–30 mo |
      | E | Lead Investor | $1,000,000+ (OMR 385,133) | SAFE/Equity (Lead rights) | 12–30 mo |
    - Cards: `Card`+`Badge`+`Separator`+`Button`, hover scale/lift, "Most Popular" emphasis.
11. **Capital Allocation Plan** — 6 categories summing to 100%: Product Development **35%**, Global Marketing and Growth **30%**, Infrastructure and AI Costs **15%**, Operations and Support **10%**, Legal and Compliance **5%**, Reserve Buffer **5%**.
12. **Traction / Milestones (Roadmap)** — 5 phases: Phase 1 Product Maturation (in-progress), Phase 2 Market Entry, Phase 3 Enterprise Pilots, Phase 4 Revenue Acceleration, Phase 5 Market Expansion. Alternating-timeline layout (intentional right/left alignment).
13. **Why Invest / Category-Defining** — supporting argument cards (Category-Defining System, Investment in a System, The Shift Is Clear).
14. **Team** — leadership profiles with credentials (e.g., "Former CMO, National Bank of Kuwait"; "Founder, Taghyeer Consulting"; GCC & international expertise).
15. **FAQ** — searchable, **category-filtered Accordion**: Investment Structure, Financials & Projections, Unit Economics, Technology & IP, Risks & Mitigations. Search `Input` filters questions. Key answers state the $1M–$3M raise and 20% participation.
16. **Contact / Register Interest** — form fields: **Full Name\***, **Email\***, Company/Organisation, Investment Range (OMR), **Message\***. Submits via `trpc.investor.submitContact`; success state renders **"Message Sent!"**. "Schedule a Call" CTA → `/book`.
17. **Footer** — brand-dark; links Home / Admin Login / Register; SmarThinkerz hub mention.

---

## 9. UX / UI Flows & Workflows

1. **Discovery → Concept learning (Home):** Hero → Explore Concepts (smooth scroll) → concept card → `/concepts/:slug`.
2. **Discovery → Investor funnel:** Home "For Investors" → `/investors` → Explore Investment Tiers (scroll) → review bands/allocation → Contact form submit *or* Download Brief *or* Schedule a Call (`/book`).
3. **Investor interest capture:** Contact form → `submitContact` tRPC → DB persist → success confirmation; `trackEvent` records engagement; surfaced to staff in Admin "Investor Interest Tracker" (`investor.getInterestStats`).
4. **Admin/staff login:** Footer/Hero "Admin Login" → dialog → Supabase auth → role-based redirect (`/admin` vs `/dashboard`).
5. **Product demo:** Home App Preview → hover video to play with audio.
6. **Cross-product navigation:** "Back to SmarThinkerz Hub" / footer hub link → external hub.

---

## 10. Interaction Patterns

- **Smooth in-page scrolling** via anchor hrefs (`#concepts`, `#investment-tiers`).
- **Hover affordances:** card lift (`-translate-y-2` / `scale 1.02, y:-5`), link color shift to cyan, "Learn more →" arrow nudge, button glow.
- **Scroll-triggered reveals** (once) for nearly all below-fold content.
- **Hover-to-play video** with audio toggle and reset on exit.
- **Modal dialog** (Radix) for admin login — focus-trapped, ESC/overlay close.
- **Accordion** expand/collapse for FAQ with live search filter + category tabs.
- **Form feedback:** inline required validation, toast notifications (sonner), disabled+spinner submit state, post-submit success view.
- **Count-up animation** on stats entering viewport.

---

## 11. Accessibility

**Implemented:**
- Semantic landmarks: `<section>`, `<footer>`, heading hierarchy (single H1 per page, H2/H3 sections — refined during SEO work).
- Descriptive `alt` text on all content images; decorative gradient overlays are non-content.
- Radix primitives (Dialog, Accordion) provide focus management, ESC handling, ARIA roles, and labelling.
- Visible focus ring globally (`outline-ring/50`); `cursor: pointer` enforced on all interactive roles via base layer.
- Form inputs paired with `<Label htmlFor>`; required fields marked.
- Tables use `<thead>/<th>` for the comparison matrices.

**Gaps / recommendations:**
- **No `prefers-reduced-motion` support** — the fixed neural canvas and reveal animations should be reduced/disabled for users who request reduced motion.
- **Decorative `NeuralCanvas`** lacks `aria-hidden="true"` (it is `pointer-events:none`, `z-index:0`, but not hidden from AT).
- **Hover-only video playback** is not keyboard/touch accessible — add explicit play control + caption track.
- **Color contrast:** verify `gray-400/500` body text on `#0a0b1e` meets WCAG AA (4.5:1) at small sizes; some muted captions are borderline.
- Gradient-clipped text relies on `-webkit-text-fill-color: transparent`; ensure fallback color for unsupported engines.

---

## 12. Functionality & Backend Contracts

**tRPC procedures referenced by these pages:**
- `investor.trackEvent` (mutation) — engagement analytics.
- `investor.submitContact` (mutation) — investor interest form.
- `investor.getInterestStats` (query) — admin tracker (downstream).
- `auth.getRoleByEmail` (query) — post-login role routing.
- Supabase `signIn` (client auth context).

**Client config:** `httpBatchLink` to `/api/trpc`, `superjson` transformer, `credentials: "include"`. Global query-cache error subscriber redirects on unauthorized.

---

## 13. SEO & Metadata

- **Per-route meta** via `usePageMeta` (title/description) + **server-injected `ROUTE_META`** static HTML snapshots in `server/_core/vite.ts` so non-JS crawlers and bots see real content (kept in sync with the React pages).
- Open Graph + Twitter Card tags, canonical URLs, favicon/apple-touch (`neural-head.png`), `opengraph.jpg` social image.
- `sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD structured data, soft-404 correctness, lazy-loading and route-level code-splitting.
- **First-paint:** critical inline `<style>` in `index.html` sets the dark background (`#0a0b1e`) + white text before JS loads, eliminating the white flash (FOUC) on a client-rendered SPA.

---

## 14. Performance Notes

- System fonts (no webfont download).
- Route-level `React.lazy` + `Suspense`; eager-load only Home + Investors.
- Below-fold images `loading="lazy" decoding="async"`; hero/video `preload="metadata"`.
- Incremental, GPU-friendly transforms for animations; canvas throttled by `requestAnimationFrame`.
- **Watch-outs:** the always-on 250-node canvas runs continuously on Home (CPU/battery on low-end devices — pair with reduced-motion gating); large CDN hero media should be sized/compressed for mobile.

---

*End of specification.*
