# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two co-equal audiences, both first-class from day one:

- **Renters** — people searching for a room, studio, or serviced apartment to rent in Vietnam. Their job: find a place that fits their budget and area, understand the real cost, and contact the landlord.
- **Landlords** — owners and small operators listing rooms and managing vacancies. Their job: publish accurate listings, get them approved, and reach renters.

**Admins** are a third role in the product, but they are operators of it, not an audience it is designed for.

*(Hypothesis, not confirmed: the sample copy skews toward students and young workers near universities and city centers. Treat as a reading of current content, not a settled audience definition.)*

## Product Purpose

Nestrivo is a Vietnam-focused rental marketplace for rooms, studios, and serviced apartments. It exists to make renting in Vietnam trustworthy on both sides: a renter can find a place that is real and whose owner is verified, and a landlord can reach renters credibly. Success means both sides treat Nestrivo as the trustworthy place to search and to list.

## Positioning

The differentiator is **verified landlord identity**: landlord verification (KYC) is an enforced part of the product, surfaced as a `VERIFIED` status, so a renter knows who they are dealing with before contacting them.

Other trust-shaped features — per-listing fee breakdown, direct contact, real photos — exist in the data model and the interface, but were **not** confirmed as the product's differentiator. Do not present them as the reason Nestrivo wins, and do not advertise them as enforced guarantees.

## Operating Context

- Web application: a Next.js frontend talking to a separate Express/Prisma backend over HTTP. Used on desktop and mobile browsers; there is no native app.
- Renter journey: search and filter by city, district, property type, and price → browse listing cards → open a listing → save it or send an inquiry.
- Landlord journey: create and manage listings, which must pass admin approval before becoming public.
- Admin journey: approve or reject listings, resolve reports, reviewed through an audit log.
- Product stage: no real listings exist yet; the app is built and reviewed against seeded sample data.

## Capabilities and Constraints

Confirmed functionality:

- Three roles: `RENTER`, `LANDLORD`, `ADMIN`; a user may hold more than one.
- Property types: `ROOM_SHARE`, `STUDIO`, `SERVICE_APARTMENT`, `WHOLE_HOUSE`.
- Listing lifecycle: `DRAFT` → `PENDING_APPROVAL` → `PUBLISHED` / `REJECTED` (with a reason) / `HIDDEN` / `EXPIRED`; availability: `AVAILABLE` / `RENTED` / `UNAVAILABLE`.
- Renter capabilities: search and filter listings, view details, save favorites, send inquiries, report a listing (fake listing, wrong price, already rented, scam, other).
- Landlord verification status: `PENDING` / `VERIFIED` / `REJECTED`.
- Per-listing fees (electricity, water, internet, service, parking, other) with units (per kWh, per m³, per month, per person, per vehicle, fixed).
- Admin audit log of moderation actions.

Hard constraints on all future work:

- **Preserve the existing backend APIs, database schema, authentication, roles, and business logic.** Frontend and design work does not get to change the contract.
- **Admin approval is mandatory** before a listing becomes publicly visible.
- **Vietnamese-only interface**, with VND currency and Vietnamese number formatting (e.g. `3.500.000 ₫/tháng`).
- Build **reusable components** and **responsive layouts**.

Explicitly undecided:

- Monetization and business model — no pricing, listing packages, commission, or subscription model has been chosen. Do not invent one.
- Geographic coverage at launch, beyond what the sample data happens to show.

## Brand Commitments

- Name: **Nestrivo**.
- Language: Vietnamese only for now.
- Currency: VND with Vietnamese formatting.
- Voice: trustworthy and professional; not promotional or hyped.
- Binding direction from the user: build a modern, trustworthy, **premium** real-estate marketplace experience. GoPlus and professional property platforms are UX inspiration only — the visual identity must be uniquely Nestrivo, not a copy. No generic AI-generated layouts, no excessive gradients, no unnecessary animation, no decorative UI.

## Evidence on Hand

- **Sample data only.** The backend is seeded with mock listings and the frontend ships `FALLBACK_LISTINGS`; listing photos are Unsplash stock placeholders, not photos of real rooms.
- No real listings, reviews, ratings, statistics, testimonials, press mentions, or partner brands exist.
- **Never fabricate real listings, reviews, statistics, testimonials, or verified badges.** A verified badge may only reflect real verification state; if no verification exists for a listing or landlord, the interface must not imply one.
- **The mock data is load-bearing.** `FALLBACK_LISTINGS` and the seeded mock listings are required for frontend development and demonstration; preserve them. Do not remove or modify existing mock listing records.
- **Mock data must always be clearly identified as sample data** wherever it is displayed.
- **Mock listings must never display a `VERIFIED` landlord badge**, and must never be presented as real listings.
- **Never fabricate customer counts, testimonials, reviews, contact information, or real-world claims.**

## Product Principles

1. **Moderation before visibility.** An unapproved listing is never public. Trust is enforced in the pipeline, not advertised on the page.
2. **Verified identity over volume.** Who the landlord is belongs in the information a renter sees, not in a badge added for decoration.
3. **Cost is a fact, not a pitch.** Listings carry their real fees, formatted in VND, so a renter can judge the true monthly cost.
4. Both renters and landlords are equally important product audiences, but their design priorities depend on the surface. The homepage (`/`) prioritizes renters and property discovery. Landlord actions remain accessible but visually secondary. Dedicated landlord dashboards and management tools should receive equal product-quality attention.
5. **Nothing fake ships.** Where real evidence does not exist, the interface says less rather than pretending.
