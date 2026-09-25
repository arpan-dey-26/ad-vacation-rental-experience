# Property image assets

The property photos are user-supplied files from Hotel photo.zip. The archive contains 43 JPEG files (not 41). Every original filename matches exactly one existing photo record. There are no missing slots and no added substitutions or generated images. Some supplied files have identical contents; their original positions are preserved.

All 43 files are copied byte-for-byte into public/images/p01.jpeg through p43.jpeg. No resizing, cropping, recompression, or photo editing was performed. The full filename/category/path/dimension/SHA-256 inventory is in supplied-photo-mapping.json.

Category mapping: p01–p03 Living room 1; p04–p10 Living room 2; p11–p12 Full kitchen; p13–p18 Bedroom; p19 Full bathroom; p20–p24 Gym; p25–p30 Exterior; p31–p33 Pool; p34–p43 Additional photos. Hero order remains p07, p04, p05, p13, p29.

Supplied resolution is 720×540 (4:3), except exterior files at 720×404 (180:101). Existing photo metadata remains 1440×1080 and 1440×808 respectively, preserving exactly the same aspect ratios and layout. Existing image IDs, ordering, spans, alt text, geometry, components and interaction behavior are unchanged.

Listing, Photo Tour and Lightbox resolve property photo sources from this shared local inventory. These property photos no longer depend on the external reference image server. No additional photos were downloaded and no earlier AI-generated files are included in public assets. The host logo is now supplied locally by Other photo.zip. No rendered image source depends on the reference image server.

This records the user-supplied source and requested use; it does not claim independent ownership or licensing verification of the supplied photographs.

## Additional supplied assets and fictional avatars

Other photo.zip contains 8 files: six nearby-stay property photographs, one 200×200 Mirashya Homes logo, and one 5572×2640 static map. Supplied files are copied byte-for-byte. See additional-asset-mapping.json for exact source filenames and local paths.

Nearby photographs map in ZIP order to s1–s6. This title association is an inference from archive order and room content, because the live reference is security-checkpoint blocked and filenames are unlabeled. The stored reference capture explicitly uses s2 for card s7 and s4 for card s8; that existing reuse pattern is preserved.

Sleeping cards reuse Hotel photo.zip p13 for Bedroom and p01 for Living room, matching the saved reference capture.

Eight co-host avatars and six reviewer avatars are original synthetic adult portraits made with the built-in image_gen tool. They depict invented people, not the actual named hosts/reviewers. The names, review content and dates remain unchanged. Final optimized 160×160 WebP files live in public/images/avatars; exact prompts and paths are in synthetic-avatar-prompts.json. No AI-generated property photographs are included.

Guest favourite uses an original small inline SVG laurel in the existing rating-summary row. Existing layout rules and geometry tokens are unchanged. A narrowly scoped .host__cohost-avatar rule styles the newly requested 20px circular portraits in the existing text row; no existing CSS selector was modified. Sleeping/nearby/map images fill their existing media boxes using only asset-specific inline background properties. Co-host portraits are 20×20 inline circles added to the existing name row. The map is a supplied static image, not an interactive map service.
