# Design Section — Video Collage Redesign

**Date:** 2026-06-02  
**Branch:** feat-map-timeline  
**Scope:** `section.frame.design` in `default.component.html / .scss / .ts`

---

## Overview

Replace the single-image building-shot in the `#design` section with two stacked sub-sections, each presenting a video collage. Videos fade in as the section enters the viewport and begin autoplaying with a staggered offset.

---

## Layout

### Section 1 — `id="design"` — Left-large / Right-small (3 videos)

Replaces the existing `section.frame.design#design`.

```
┌─ section.frame.design#design ────────────────────────────────┐
│  col-narrow (sticky)        │  col-wide                       │
│  eyebrow: THE CLUBHOUSE     │  .vg-left-wide (CSS grid)       │
│  「獨棟公設，               │  ┌──────────┬──────┐           │
│    讓你的家，               │  │          │ [V2] │           │
│    只是你的家。」           │  │  [V1]    ├──────┤           │
│  副文案: 一條動線…          │  │          │ [V3] │           │
└─────────────────────────────┴──┴──────────┴──────┘           │
```

Grid — final video assignments:
- `[V1]` `garden-02.webm` — `grid-column:1; grid-row:1/3` — caption: `OUTDOOR GROVE · 戶外林蔭`
- `[V2]` `garden-01.webm` — `grid-column:2; grid-row:1` — caption: `GARDEN PATH · 花園弧形步道`
- `[V3]` `pool.webm`      — `grid-column:2; grid-row:2` — caption: `THE POOL · 游泳池`

### Section 2 — `id="design-b"` — Top-large / Bottom 2×2 (5 videos)

New `section.frame.design` appended after `#design`.

```
┌─ section.frame.design#design-b ──────────────────────────────┐
│  col-narrow (sticky)        │  col-wide                       │
│  eyebrow: THE AMENITIES     │  .vg-top-wide (CSS grid)        │
│  「每一個角落，             │  ┌──────────────────────┐      │
│    都是你的                 │  │      [V4] main-gate  │      │
│    私人領地。」             │  └──────────────────────┘      │
│                             │  ┌───────────┬──────────┐      │
│                             │  │[V5] rest. │[V6]theat.│      │
│                             │  ├───────────┼──────────┤      │
│                             │  │[V7] elev. │[V8] bar  │      │
│                             │  └───────────┴──────────┘      │
└─────────────────────────────┴────────────────────────────────┘
```

Grid — final video assignments:
- `[V4]` `main-gate.webm`  — `grid-column:1/3; grid-row:1` height 52vh — `LOBBY · 門廳`
- `[V5]` `restaurant.webm` — `grid-column:1; grid-row:2`  height 36vh — `DINING · 食憩`
- `[V6]` `theater.webm`    — `grid-column:2; grid-row:2`  height 36vh — `THEATER · 多功能視聽室`
- `[V7]` `elevator.webm`   — `grid-column:1; grid-row:3`  height 36vh — `ELEVATOR HALL · 電梯廳`
- `[V8]` `bar.webm`        — `grid-column:2; grid-row:3`  height 36vh — `SKY LOUNGE · 星空酒吧`

---

## Animation

### Scroll Fade-in (GSAP ScrollTrigger)

Use the existing GSAP ScrollTrigger pattern in `ngAfterViewInit`.

```ts
// Section 1 (#design)
gsap.from('#design .vg-card', {
  opacity: 0, y: 30, duration: 0.9, ease: 'power2.out', stagger: 0.25,
  scrollTrigger: {
    trigger: '#design',
    start: 'top 75%',
    onEnter: () => {
      const videos = Array.from(document.querySelectorAll('#design video'));
      videos.forEach((v, i) => setTimeout(() => (v as HTMLVideoElement).play(), i * 350));
    },
  },
});

// Section 2 (#design-b) — 5 videos, tighter stagger to avoid >1.4 s delay on last card
gsap.from('#design-b .vg-card', {
  opacity: 0, y: 30, duration: 0.9, ease: 'power2.out', stagger: 0.2,
  scrollTrigger: {
    trigger: '#design-b',
    start: 'top 75%',
    onEnter: () => {
      const videos = Array.from(document.querySelectorAll('#design-b video'));
      videos.forEach((v, i) => setTimeout(() => (v as HTMLVideoElement).play(), i * 250));
    },
  },
});
```

All `<video>` elements: `muted loop playsinline`. No `autoplay` attribute — play is triggered by scroll.

---

## HTML Structure

```html
<!-- Section 1: left-large / right-small — keeps id="design" for nav -->
<section class="frame design" id="design">
  <div class="inner">
    <div class="col-narrow">
      <div class="eyebrow">
        <span class="num">THE CLUBHOUSE · 獨棟會館</span>
      </div>
      <div style="height: 4rem"></div>
      <h3 class="pull-zh">獨棟公設，<br />讓你的家，<br />只是你的家。</h3>
      <p class="text-base mt-10 leading-normal">
        一條動線屬於生活，<br/>一條動線屬於招待
      </p>
    </div>
    <div class="col-wide">
      <div class="video-grid vg-left-wide">
        <div class="vg-card vg-card--main">
          <video muted loop playsinline src="assets/video/garden-02.webm"></video>
          <div class="caption-fade">OUTDOOR GROVE · 戶外林蔭</div>
        </div>
        <div class="vg-card vg-card--side">
          <video muted loop playsinline src="assets/video/garden-01.webm"></video>
          <div class="caption-fade">GARDEN PATH · 花園弧形步道</div>
        </div>
        <div class="vg-card vg-card--side">
          <video muted loop playsinline src="assets/video/pool.webm"></video>
          <div class="caption-fade">THE POOL · 游泳池</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Section 2: top-large / 2×2 grid — 5 videos -->
<section class="frame design" id="design-b">
  <div class="inner">
    <div class="col-narrow">
      <div class="eyebrow">
        <span class="num">THE AMENITIES · 公設精選</span>
      </div>
      <div style="height: 4rem"></div>
      <h3 class="pull-zh">每一個角落，<br />都是你的<br />私人領地。</h3>
      <p class="text-base mt-10 leading-normal">
        — 文案待補 —
      </p>
    </div>
    <div class="col-wide">
      <div class="video-grid vg-top-wide">
        <div class="vg-card vg-card--top">
          <video muted loop playsinline src="assets/video/main-gate.webm"></video>
          <div class="caption-fade">LOBBY · 門廳</div>
        </div>
        <div class="vg-card vg-card--bot">
          <video muted loop playsinline src="assets/video/restaurant.webm"></video>
          <div class="caption-fade">DINING · 食憩</div>
        </div>
        <div class="vg-card vg-card--bot">
          <video muted loop playsinline src="assets/video/theater.webm"></video>
          <div class="caption-fade">THEATER · 多功能視聽室</div>
        </div>
        <div class="vg-card vg-card--bot">
          <video muted loop playsinline src="assets/video/elevator.webm"></video>
          <div class="caption-fade">ELEVATOR HALL · 電梯廳</div>
        </div>
        <div class="vg-card vg-card--bot">
          <video muted loop playsinline src="assets/video/bar.webm"></video>
          <div class="caption-fade">SKY LOUNGE · 星空酒吧</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## SCSS

### `.vg-left-wide`

```scss
.vg-left-wide {
  display: grid;
  grid-template-columns: 1.85fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
  height: 78vh;
  min-height: 540px;

  .vg-card--main {
    grid-column: 1;
    grid-row: 1 / 3;
  }
  .vg-card--side {
    grid-column: 2;
  }
}
```

### `.vg-top-wide`

5-video grid: 1 full-width header + 2×2 body.

```scss
.vg-top-wide {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 52vh 36vh 36vh;
  gap: 0.5rem;

  .vg-card--top {
    grid-column: 1 / 3; // spans full width
  }
  .vg-card--bot {
    grid-column: span 1; // 4 cards fill 2×2
  }
}
```

### `.vg-card`

```scss
.vg-card {
  position: relative;
  overflow: hidden;
  background: #1a1a18; // fallback while video loads

  video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .caption-fade {
    // reuse existing .caption-fade styles
  }
}
```

### RWD < 900px

```scss
@media (max-width: 900px) {
  .vg-left-wide {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto;

    .vg-card--main { height: 56vw; grid-row: auto; }
    .vg-card--side { height: 40vw; }
  }

  .vg-top-wide {
    grid-template-columns: 1fr 1fr; // keep 2-col for small cards
    grid-template-rows: auto;

    .vg-card--top { height: 52vw; }
    .vg-card--bot { height: 36vw; }
  }
}
```

---

## Files to Change

| File | Change |
|------|--------|
| `default.component.html` | Replace `section.frame.design` with two new sections; first keeps `id="design"` (nav target), second gets `id="design-b"` |
| `default.component.scss` | Add `.video-grid`, `.vg-left-wide`, `.vg-top-wide`, `.vg-card` styles; remove `.design .building-shot` and `.design .arc-essay` blocks |
| `default.component.ts` | Remove GSAP blocks targeting `.design .building-shot`, `.design .arc-essay`, `.design .building-shot .quote-overlay .q` (lines ~551–665); add new ScrollTrigger blocks for `#design` and `#design-b` `.vg-card` elements with `onEnter` video play stagger |

### Nav ID note

`navItems` at line 117 uses `{ id: 'design', label: '大師巨作' }`. The first new section **must keep `id="design"`** — rename the spec's `#design-a` to just `id="design"` in implementation.

---

## Out of Scope

- No sound controls / mute toggle UI
- No video progress indicator
- Section 2 body copy — left as "— 文案待補 —" placeholder
