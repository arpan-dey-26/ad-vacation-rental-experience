# Final submission status — 25 September 2026

Public production URL: https://stayvista-airbnb-clone.vercel.app
Vercel deployment: dpl_6EyzLZEYdnjEX2h6fUpwXrh54tBY — READY, production.

## Verification

- npm install: PASS.
- TypeScript: PASS.
- ESLint: PASS.
- Next.js production build: PASS.
- Geometry: PASS, 66 assertions across 3 viewports.
- Interactions: PASS, 22 assertions.
- Photo Tour: PASS, 113 assertions.
- Lightbox: PASS, 100 assertions.
- Release/E2E: PASS, 110 assertions over 3 complete cycles.
- Structural accessibility: PASS, zero reported problems.
- Token/provenance: PASS.
- Existing image queue tests: PASS, without queue implementation changes.
- Real-asset production-build browser test: PASS. All 43 tour photos and all 43 lightbox positions loaded, plus 9 thumbnails, 5 hero photos, 14 avatars and supplied backgrounds. No external or HTTP 429 image responses.
- Public production HTTP verification: all 65 image files returned HTTP 200 and matched local file SHA-256 hashes.
- Actual production browser QA: listing, hero, sleeping cards, reviews, Guest favourite, host logo, co-hosts, map, both nearby carousel pages, Photo Tour, Lightbox next/previous, arrow keys, counter/caption, Escape and close verified. No major broken images observed.

Local TypeScript, lint and token checks passed. Windows sandbox child-process restrictions prevented normal local Next build/browser harness execution; the full unchanged suite and production build passed in Vercel's Linux build environment before release. The new real-asset harness supplements rather than replaces the existing tests.

## Assets

Hotel photo.zip contains 43 property JPEG files, not 41. Original filenames matched p01–p43 exactly; no missing slots or introduced substitutions. All supplied files were copied byte-for-byte. Full filename, category, path, dimensions and hashes: supplied-photo-mapping.json.

Property order: p01–03 Living room 1; p04–10 Living room 2; p11–12 kitchen; p13–18 bedroom; p19 bathroom; p20–24 gym; p25–30 exterior; p31–33 pool; p34–43 additional. Hero remains p07, p04, p05, p13, p29. Sleeping cards use p13 and p01.

The archive itself contains duplicate contents at p02/p43, p13/p16, p28/p29 and p31/p33. These original positions were preserved.

Other photo.zip contains 8 assets: 6 nearby-stay photos, Mirashya Homes logo and Candolim static map. Exact filenames and paths: additional-asset-mapping.json.

Nearby mapping: s1 Beautiful Studio, s2 NAQAB, s3 Greentique, s4 Tropical Studio, s5 Casa Bella, s6 Kanso use the six supplied photos in ZIP order. This association is inferred from archive order and content, not independently confirmed against the blocked live reference. Cards s7 Luxury Apt and s8 Serendipity reuse s2 and s4 respectively, matching the saved reference's reuse pattern.

Original fictional adult avatars were generated for co-hosts Sharath, Aman Dev Pahwa, Maria Karen Priyanka, Simran, Pallavi, Sanyukta, Shruti and Amisha; reviewers Amit, Aheesh, Samiksha, Vedant, Vaibhav S and Mohd. These are not portraits of the named real people. Prompt provenance: synthetic-avatar-prompts.json. No generated property photos are included. No asset slots remain empty.

## Scope and limitations

Next.js was updated only from 15.5.4 to 15.5.26; React remains 19.1.1. Existing geometry, layout selectors, gallery/lightbox logic and accessibility behavior were preserved. A small new CSS rule fits requested co-host portraits into their existing text row. Supplied image backgrounds fill existing media boxes. Guest favourite has an original small decorative laurel.

Existing Share/reservation controls retain their prior behavior; this asset update does not add a booking backend or sharing integration. The supplied map is static. Historical planning documents describe earlier development limitations; this report records the final validation and deployment state. No pixel-perfect comparison against the blocked live reference is claimed.

## Run

npm install
npm run dev

For release checks: npm run typecheck; npm run lint; npm run build.
For existing browser harnesses, install Playwright and esbuild as described in README.md, then npm run verify:harness. After building, node scripts/verify-assets.mjs exercises actual local assets using a production server.
