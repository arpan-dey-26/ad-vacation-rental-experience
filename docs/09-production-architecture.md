# 09 — Production architecture

Requirement H asks for a high-level architecture for a **production-scale
vacation-rental marketplace**, not for this clone. This document is the written
form; `docs/architecture/` will carry the exported diagram (H9).

The clone itself stays a static Next.js app with no backend (G3, G4). Nothing
below is built for the submission.

## Request path

```text
                        ┌──────────────┐
   Browser ──────────▶  │  Anycast DNS │
                        └──────┬───────┘
                               ▼
                        ┌──────────────┐   static assets, ISR HTML,
                        │  CDN + WAF   │◀─ images, JS/CSS at the edge
                        │  (edge PoPs) │   bot mgmt, rate limit, TLS
                        └──────┬───────┘
                               ▼
                    ┌──────────────────────┐
                    │  Global load balancer │  health checks, region failover
                    └──────────┬───────────┘
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
      │ Web tier    │  │  API gateway │  │ Image service│
      │ Next.js SSR │  │  authn/authz │  │ resize/format│
      │ (stateless) │  │  quota, edge │  │  (on-the-fly)│
      └─────────────┘  └──────┬───────┘  └──────┬───────┘
                              ▼                 ▼
         ┌───────────┬────────┴──────┬──────────────┐   object storage
         ▼           ▼               ▼              ▼   (originals)
   ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐
   │ Listing  │ │  Search  │ │  Booking   │ │ Identity │
   │ service  │ │ service  │ │  service   │ │ service  │
   └────┬─────┘ └────┬─────┘ └─────┬──────┘ └────┬─────┘
        │            │             │             │
        ▼            ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐
   │Postgres │  │ OpenSearch│ │ Postgres │  │ Postgres│
   │(listings│  │ + geo idx │ │(bookings,│  │ (users) │
   │ sharded)│  │           │ │ ledger)  │  │         │
   └─────────┘  └─────────┘  └──────────┘  └─────────┘
        │            ▲             │
        └────────────┴─────────────┘
           events via Kafka/SNS+SQS → search indexer,
           pricing, notifications, analytics, fraud
```

## Frontend

- Next.js on the edge. Listing pages are the dominant read: they are **ISR** —
  statically generated, revalidated on a listing-updated event, served from the
  CDN. A listing page should almost never reach an origin.
- Personalised fragments (saved state, prices in the user's currency, availability
  for the user's dates) are fetched client-side after paint, so the cached HTML
  stays shared across all users.
- Scaling is horizontal and stateless: no session affinity, autoscale the web
  tier on CPU and p95 latency, and let the CDN absorb the long tail.

## API layer

- A gateway in front of the services: TLS termination, authn, per-token quotas,
  request shaping, schema validation. It is where abuse is stopped, not the
  services.
- Internally, gRPC between services; REST/GraphQL at the public edge.
- Idempotency keys on every mutating call, because retries are guaranteed at this
  scale.

## Services

| Service | Owns | Scaling note |
| --- | --- | --- |
| Listing | Listing content, photos, amenities, host association | Read-dominated; heavy caching, read replicas |
| Search | Query, geo, filters, ranking | Its own datastore; never queries listing's DB |
| Booking | Availability, reservations, payment orchestration | The only strongly-consistent path; scales vertically before horizontally |
| Identity | Users, sessions, OAuth, permissions | Token verification at the edge to keep it off the hot path |
| Pricing | Dynamic rates, discounts, fees | Async, precomputed; read from cache |
| Reviews | Review write/read, aggregate ratings | Aggregates recomputed off events, not on read |
| Messaging | Guest–host threads | Websocket tier, separately scaled |
| Notification | Email, push, SMS | Queue-driven, retried, deduped |

## Data

- **Postgres** per bounded context. Listings shard by listing id; bookings shard
  by property id so all of a property's availability lives in one shard, which is
  what the overlap check needs.
- **Availability and booking** are the only place that needs serialisable
  isolation. A reservation takes a transactional lock on the property's date
  range; double-booking is prevented in the database with an exclusion
  constraint on a date range type, not in application code.
- **Read replicas** for listing and review reads; the write primary serves only
  writes.
- **Redis** for hot listing documents, session tokens, rate-limit counters and
  search-result caching, with a stampede guard (single-flight + jittered TTL) so
  a popular listing's expiry does not hit the database with a thundering herd.

## Search

- **OpenSearch / Elasticsearch** with geo-spatial indexing. Filters (dates,
  price, guests, amenities) plus a ranking model.
- Indexed **asynchronously from events**, never by dual-writing from the listing
  service. Search is eventually consistent by design and that is acceptable; a
  listing appearing in results 2 seconds late is fine, a listing service blocked
  on an index write is not.
- Availability is the hard part: rather than indexing every date, index a coarse
  availability bitmap for filtering and confirm exact availability against the
  booking service for the visible result page only.

## Storage and images

- Originals in object storage (S3/GCS), versioned, lifecycle-tiered to cold
  storage after a listing is delisted.
- An image service generates derivatives on demand (AVIF/WebP, multiple widths),
  cached at the CDN. Never resize in the web tier.
- Signed URLs for anything private; public listing photos served straight from
  the CDN.

## Events

Kafka (or SNS+SQS) as the backbone. `listing.updated` fans out to the search
indexer, the ISR revalidation hook and the analytics pipeline;
`booking.confirmed` fans out to notifications, the payment ledger, the host
calendar and fraud scoring. Consumers are idempotent and use a dead-letter queue;
at-least-once delivery is assumed everywhere.

## Observability

- Structured logs with a trace id propagated from the edge through every hop.
- Distributed tracing (OpenTelemetry) — the p99 on a listing page is usually one
  slow downstream, and you cannot find it without traces.
- RUM for real user latency and Core Web Vitals, because synthetic checks will
  not show what a user in Kolkata on 4G experiences.
- SLOs with error budgets: availability and p95 latency per service, alerting on
  burn rate rather than on raw thresholds.

## Deployment

- Everything containerised, orchestrated (Kubernetes or an equivalent managed
  runtime), infrastructure as code.
- Blue/green or canary per service, with automated rollback on SLO burn.
- Multi-region active-active for reads; a single write region per shard with
  documented failover. Database failover is the longest RTO in the system and is
  rehearsed, not assumed.
- Feature flags so a risky change ships dark and is enabled progressively.

## Failure thinking

| Failure | Response |
| --- | --- |
| Search cluster down | Listing pages still serve from the CDN; search degrades to a cached "popular in this area" set rather than a 500 |
| Booking DB primary lost | Reads continue from replicas; writes fail closed with a clear message — never optimistically confirm a booking |
| Image service saturated | CDN serves stale derivatives; new uploads queue |
| Region loss | DNS/anycast shifts traffic; read traffic recovers in seconds, write traffic after the documented DB failover |
| Traffic spike (a listing goes viral) | CDN absorbs it; Redis single-flight prevents a cache stampede; autoscaling handles the personalised-fragment calls |
| Poison message in a queue | Retry with backoff, then DLQ with an alert — never block the partition |

## Why the clone does not use any of this

The submission is a single listing page with two overlays. Introducing a backend
would add deployment surface and failure modes without improving fidelity,
behaviour or accessibility — the four things actually being graded. The
architecture above demonstrates the thinking (I3) and the app demonstrates the
craft.
