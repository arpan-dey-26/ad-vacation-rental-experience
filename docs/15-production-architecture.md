# 15 — Reference production architecture

The diagram this accompanies is `docs/architecture.png` (also `.pdf`; editable
source `docs/architecture/architecture.html`, rebuilt with
`npm run docs:architecture`).

## What this document is, and is not

It is the production-scale architecture the assignment asks for (requirement
H9): the system a listing experience of this kind sits inside at marketplace
scale.

It is **not** a description of this repository. StayVista as submitted is a
desktop front end with a frontend-held data layer and no backend at all. It
implements none of the services, databases, queues or integrations below. On the
diagram exactly one node carries a green outline — "Web — desktop" — and that is
the whole of what exists.

That separation is deliberate. A diagram that blurs the two reads as a claim to
have built thirteen services, and the brief asks for an architecture, not a
boast. `09-production-architecture.md` covers the same ground from the angle of
requirement H's discussion points; this document is the diagram's companion and
is organised around the flows.

---

## A. Browse and search

```text
Client → CDN / WAF → API gateway → Search → search index
                                      ↓
                                   Listing → cache → read replica (on miss)
                                      ↓
                                   response
```

Search resolves a query against a denormalised index rather than the relational
store, because search predicates (geo radius, date range, amenity sets, ranking)
are exactly what a normalised schema is worst at. The index is rebuilt from
events, not written synchronously — so a listing edit appears in search a short,
bounded time later, and that eventual consistency is a design choice rather than
a defect.

Listing reads go to cache first and a read replica on miss. The primary is not
on this path at all. That is what lets read traffic, which dominates by orders of
magnitude, scale independently of write capacity.

**Cache strategy.** Hot listings and computed prices are cached with a TTL and
invalidated by event: the TTL bounds staleness if an event is missed, the event
makes the common case immediate. Cache keys include the variant dimensions
(currency, locale, date range) so one guest's price is never served to another.

---

## B. Listing photos

```text
Client → CDN → object storage (on miss)
```

Media never transits an application service. Originals live in object storage;
derivatives (sized, compressed, format-negotiated) are produced by the media
pipeline and served from the same origin behind the CDN. The application stores
references, not bytes.

**What this repository does instead.** StayVista packages no photograph. The data
layer holds the reference's URLs behind a single `ORIGIN` constant and the
browser fetches them at runtime — linking, not redistributing. The reasoning and
its limits are in `13-asset-strategy.md`. The tour requests 43 images lazily and
the lightbox one eagerly; neither is preloaded in bulk.

---

## C. Booking

```text
Client → gateway → Booking → Availability   (transactional hold)
                        ↓
                     Pricing               (quote, re-validated server-side)
                        ↓
                     Payment → PSP         (authorise, then capture)
                        ↓
                  booking database
                        ↓
                   event bus → notifications, host tools, analytics
```

This is the only flow in the system that genuinely cannot be eventually
consistent, and it is where the interesting failure modes live.

**Double-selling** is prevented by taking a hold on the availability record
inside a transaction before payment is attempted, and releasing it on failure or
expiry. A distributed lock is the alternative; a transactional hold in the store
that owns the calendar is simpler and has fewer liveness hazards.

**Idempotency.** The client generates an idempotency key per booking attempt and
sends it with every retry. Booking and Payment both key on it, so a retried
request after a timeout returns the original result rather than charging twice.
This matters more than it sounds: the network failure most likely to occur is
precisely the one where the client does not know whether the charge succeeded.

**Price is re-validated server-side.** The quote the client displays is an input
to the request, never the authority for what is charged.

**Card data never reaches our systems.** The PSP is integrated such that card
details go from the client to the provider directly; we hold tokens.

---

## D. Host listing update

```text
Host → Host / Admin → Listing → database
                                   ↓
                              event bus
                            ↙            ↘
              search re-index          media processing → CDN invalidation
```

A write lands in the relational store and emits an event. Everything downstream
— the search index, derivative images, cached fragments, recommendation features
— is rebuilt from that event rather than written inline. The host's own view
reads through to the primary so their change is visible to them immediately;
everyone else sees it when the index catches up.

Media uploaded here goes to object storage first and is processed
asynchronously, because transcoding in a request handler is how an upload
endpoint becomes a timeout.

---

## E. Reviews

```text
Guest → Review → moderation → database → event pipeline → listing aggregates
```

Review submission is cheap; aggregation is not. Recomputing a listing's rating
breakdown inside the write path would make one guest's review latency a function
of how many reviews the listing already has. Aggregates are therefore recomputed
asynchronously and stored, and the listing read serves the stored aggregate.

Moderation sits between submission and publication rather than after it, because
retracting a published review is materially worse than delaying an honest one.

---

## Cross-cutting design notes

These are recommendations for a production marketplace. None is implemented
here.

**Stateless services, horizontal scale.** No application service holds session
state; sessions live in the cache or in a signed token. Any instance can serve
any request, so scaling is a matter of adding instances behind the load
balancer, and a lost instance costs only its in-flight requests.

**Database replication.** A primary for writes, replicas for reads, with replica
lag treated as a budget rather than an assumption — read-after-write for the
author goes to the primary, everyone else reads a replica.

**Eventual consistency where it is affordable.** Search, recommendations and
aggregates. Never bookings or payments.

**Rate limiting** at the gateway, per principal rather than per IP where the
caller is authenticated, so one noisy integration cannot degrade everyone.

**Authentication and authorisation.** Identity at the edge; per-service identity
inside, with least-privilege authorisation checked in the service that owns the
resource rather than only at the gateway.

**Secret management.** Managed secret store, rotation, no secret in an image, an
environment file in version control, or a build log.

**Encryption.** TLS in transit including between internal services; managed keys
at rest.

**Audit logging.** Immutable, append-only, for every privileged and
money-touching action — who did what to which booking, and when.

**Observability.** Structured logs with a correlation id threaded from the edge;
metrics as RED for services and USE for resources; distributed tracing across the
booking path in particular, because that is where a latency regression is
expensive and hardest to attribute. Alerting on SLO error budgets rather than on
raw thresholds.

**Disaster recovery.** Cross-region backups with point-in-time recovery, and
restores exercised on a schedule. A backup that has never been restored is a
hypothesis, not a backup.

---

## What this project would need to become that

An honest gap list, for the reviewer who asks "what is missing":

| Area | Today | Next step |
| --- | --- | --- |
| Data | One typed module, 43 photos, one listing | A Listing service with a real schema and a read path through cache |
| Search | None | An index and a query API; the section nav becomes a real filter |
| Booking | The card renders a price and a date range; nothing is reserved | Availability holds, idempotency keys, payment integration |
| Media | Runtime links to the reference origin | Own storage, own derivatives, own CDN |
| Auth | None | Sessions, roles, per-resource authorisation |
| Async | None | An event bus and workers before search or aggregates become real |

The front end is deliberately shaped so this is additive: content already comes
from a typed data layer rather than from JSX, so the substitution is at the data
boundary and not through the components.
