# Prompt 01 — Project Discovery & Foundation (full text)

Date: 2026-09-18 · Tool: Claude (Cowork), model `claude-opus-5`
Attachments: 3 screenshots of the Playpower assignment brief.

---

You are the lead frontend engineer, UI reconstruction specialist, accessibility
engineer, and AI-development workflow architect for this take-home assignment.

I have attached 3 screenshots/images containing the complete assignment
brief from Playpower. READ AND ANALYZE ALL 3 ATTACHED IMAGES CAREFULLY
BEFORE DOING ANYTHING.

These attachments contain the official requirements, expected screens,
reference screenshots, technology guidance, evaluation criteria,
architecture requirements, AI workflow requirements, and submission
requirements.

PROJECT NAME:
StayVista — Airbnb Listing Experience Clone

OFFICIAL REFERENCE:
https://airbnb-clone-umber-two.vercel.app

## CORE OBJECTIVE

Build an exceptionally polished, desktop-only implementation of the
reference Airbnb listing experience.

The evaluator will compare our implementation against the reference
visually AND behaviourally.

The quality target is:

- pixel-level visual fidelity
- behavioural parity
- smooth and intentional interactions
- accurate animations and transitions
- accessibility
- clean production-quality architecture
- excellent code quality
- thoughtful AI-assisted development workflow

Do NOT build a generic Airbnb-inspired website.

The final result should feel like a carefully reconstructed,
production-quality interface.

## CRITICAL ORIGINALITY / PLAGIARISM RULE

The reference website is ONLY a visual and behavioural specification.

DO NOT:

- copy its source code
- scrape its source code
- lift-and-shift its implementation
- copy its JavaScript
- copy its React components
- copy its CSS source
- copy its DOM structure wholesale
- use an existing Airbnb clone repository
- reproduce hidden implementation details
- directly reuse code obtained from the reference URL

All application code must be independently implemented.

We can inspect the reference's visible behaviour and appearance,
but the implementation must be original.

The assignment explicitly warns about plagiarism detection, so originality
is a hard requirement.

## FIRST TASK: DISCOVERY ONLY

DO NOT IMPLEMENT THE COMPLETE APPLICATION YET.

First perform a detailed discovery and planning phase.

Use the attached assignment screenshots as the official task requirements.

Use the reference URL as the visual/behavioural source of truth.

Carefully inspect the reference in a browser if browser access is
available.

Analyze the reference rather than immediately coding.

### 1. ASSIGNMENT REQUIREMENTS

Extract and organize all requirements from the 3 attached screenshots.

Create a checklist containing:

- Listing Page requirements
- Photo Tour requirements
- Lightbox requirements
- Animation requirements
- Interaction requirements
- Accessibility requirements
- Desktop-only constraint
- Tech-stack expectations
- Architecture diagram requirements
- AI workflow requirements
- Sub-agent/skill configuration requirements
- Submission requirements
- Public GitHub restriction
- Prompt-sequence requirement
- Originality/plagiarism requirements

Do not omit small requirements.

### 2. REFERENCE UI ANALYSIS

Analyze the reference page section by section.

Document:

- overall page structure
- header
- navigation
- property heading
- image gallery
- hero image
- secondary images
- property information
- amenities
- booking area
- reviews
- location
- host section
- footer
- any other visible sections

For each section identify:

- layout
- approximate dimensions
- spacing
- alignment
- typography
- font sizes
- font weights
- colors
- borders
- border radii
- shadows
- icons
- image aspect ratios
- hover behaviour
- active states
- scroll behaviour
- sticky elements

Do not simply describe what the page contains.
Think like a frontend engineer reconstructing the interface from
observed behaviour.

### 3. THREE REQUIRED VIEWS

Analyze all three required views separately.

VIEW 1: Listing Page
VIEW 2: Photo Tour
VIEW 3: Lightbox

For each view document:

- how it opens
- how it closes
- layout
- animations
- transitions
- keyboard interaction
- mouse interaction
- focus behaviour
- scrolling behaviour
- overlay behaviour

### 4. MOTION / ANIMATION ANALYSIS

Pay special attention to animation because the assignment explicitly
evaluates animations and motion.

Identify every meaningful animation or transition that can be observed.

For each one document:

- trigger
- element
- initial state
- final state
- approximate duration
- easing
- direction
- opacity/transform behaviour
- whether the background scrolls
- whether focus changes

Do NOT invent unnecessary animations.

The implementation should match the reference's motion language.

Where the reference is subtle, keep our animation subtle.

Performance matters:
prefer CSS transform/opacity animations and avoid unnecessary
JavaScript-driven animation.

Also plan support for: prefers-reduced-motion

### 5. ACCESSIBILITY ANALYSIS

Create an accessibility plan covering:

- semantic HTML
- keyboard navigation
- tab order
- focus indicators
- accessible buttons
- aria labels
- dialog semantics
- focus trapping
- focus restoration
- Escape-to-close
- left/right keyboard navigation
- body scroll locking
- screen-reader considerations

Especially analyze the Photo Tour and Lightbox.

### 6. DESIGN SYSTEM

Create a proposed design token system for our implementation.

Include:

- typography
- spacing
- colors
- radii
- borders
- shadows
- transitions
- z-index layers
- container widths
- common component dimensions

These are implementation tokens derived from observation, not copied
source code.

### 7. COMPONENT ARCHITECTURE

Design a clean reusable component architecture.

Prefer something similar to:

```text
src/
  app/
  components/
  data/
  hooks/
  lib/
  styles/
```

Potential components:

Header, ListingHeader, HeroGallery, GalleryTile, ListingOverview, Amenities,
BookingCard, Reviews, LocationSection, HostSection, SimilarStays, PhotoTour,
PhotoCategory, Lightbox, LightboxControls

Do not create unnecessary components just for the sake of abstraction.

Do not create one enormous page component.

### 8. DATA MODEL

Design an independent listing data model.

Keep property information, images, amenities, reviews and gallery
metadata separate from UI components.

The UI should consume structured data rather than having large amounts
of hardcoded content inside JSX.

### 9. PROJECT STRUCTURE

Propose the complete project structure.

Include:

- application source
- reusable components
- hooks
- data
- styling
- public assets
- documentation
- architecture diagram
- Claude agents
- Claude skills
- prompt documentation

We need:

```text
.claude/
  agents/
  skills/
docs/
PROMPTS.md
README.md
```

### 10. AI WORKFLOW

This assignment explicitly evaluates AI-native development.

We will use focused AI workflows rather than asking one AI agent to
blindly generate the entire project.

Plan useful sub-agents such as:

1. Visual Fidelity Reviewer
2. Accessibility Reviewer
3. Interaction/Motion Reviewer
4. Code Quality Reviewer

Plan useful skills for:

- visual fidelity analysis
- accessibility auditing
- final QA

These configurations must contain useful instructions and should
actually be usable during development.

Do not create decorative or fake configuration files.

### 11. PROMPTS.MD

Create: PROMPTS.md

This will contain the chronological sequence of important prompts used
during AI-assisted development.

Record this current instruction as: Prompt 01 — Project Discovery & Foundation

Later prompts will be appended chronologically.

The final submission must be able to demonstrate how AI was used during
development.

### 12. PRODUCTION ARCHITECTURE

Do not build an unnecessary backend for the clone unless required.

However, separately plan a high-level production architecture for a
large-scale vacation-rental marketplace as requested by the assignment.

The architecture should cover:

- frontend delivery
- CDN
- WAF/load balancing
- API layer
- backend services
- listing service
- search
- booking
- authentication
- databases
- caching
- object/image storage
- queues/events
- observability
- deployment
- horizontal scaling
- failure considerations

We will create the final architecture diagram later.

### 13. QUALITY GATE

The application must NOT be considered complete merely because:

- it compiles
- it runs
- the page looks roughly similar

Our development process must eventually include:

IMPLEMENT → RUN → VISUAL REVIEW → BEHAVIOURAL REVIEW → ACCESSIBILITY REVIEW
→ FIX → RECHECK → BUILD

The final quality gate should include:

- TypeScript check
- lint
- production build
- interaction testing
- keyboard testing
- accessibility review
- visual fidelity review
- animation review
- console error review
- unused code/dependency review

## IMPORTANT: DO NOT RUSH

Do not start implementing the entire UI now.

Do not make assumptions when something can be inspected.

Do not over-engineer the project.

A clean, complete and highly polished implementation is more important
than unnecessary features.

## OUTPUT REQUIRED FROM THIS PHASE

1. Complete assignment requirement checklist
2. Detailed reference/page breakdown
3. Three-view interaction map
4. Animation/motion map
5. Accessibility plan
6. Design token proposal
7. Component architecture
8. Data model
9. Project folder structure
10. AI agent/skill plan
11. Production architecture plan
12. Development roadmap divided into logical phases
13. Risks and things that require careful visual verification

Then initialize the project foundation and documentation files only.

Do NOT implement the complete UI yet.

Run basic validation after initialization.

Finally report:

- files created
- files modified
- dependencies added
- validation performed
- decisions made
- remaining work

Then STOP.

Wait for the next instruction.
