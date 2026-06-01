import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { BBDBaseComponent } from '@core/shared';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Walk { p: string; m: string; n: string; }
interface SpecCell { k: string; v: string; sub: string; }

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
})
export class DefaultComponent extends BBDBaseComponent implements AfterViewInit, OnDestroy {
  scrolled = false;
  pastHero = false;
  active = 'hero';

  layout: '47' | '52' | 'any' = 'any';
  purpose: 'self' | 'asset' | 'tbd' = 'self';
  submitted = false;

  readonly assetBase = 'assets/image';
  readonly img = {
    hero: `${this.assetBase}/photo/hero-bg.webp`,
    work1: `${this.assetBase}/refers/外觀/102.jpg`,
    work2: `${this.assetBase}/refers/外觀/104.jpg`,
    work3: `${this.assetBase}/refers/外觀/105.jpg`,
    circle: `${this.assetBase}/refers/公設-內部/164.jpg`,
    tower: `${this.assetBase}/refers/外觀/108.jpg`,
    map: `${this.assetBase}/機能地圖/500.svg`,
    craftHero: `${this.assetBase}/refers/外觀/158.jpg`,
  };

  /**
   * Springs-style split-bay showcase (image-left / coloured-panel-right, pinned + parallax).
   */
  readonly springsBays: Array<{
    id: string;
    title: string;
    tag: string;
    src: string;
    lede: string;
    stats: string[];
    theme: 'cream' | 'forest' | 'umber';
  }> = [
    {
      id: 'bay-lobby',
      title: 'Lobby',
      tag: 'A RITUAL OF ARRIVAL',
      src: `${this.assetBase}/公設-內部/164.jpg`,
      lede:
        '迎賓大廳是日常的第一句問候。從車道到玄關，動線被細細編排——一條屬於生活，一條屬於招待。當門在身後闔上，城市的喧囂便留在了外面。',
      stats: [
        '挑高 9 米大廳',
        '雙動線分流 · 住戶 / 訪客',
        '24h 飯店式禮賓',
        '進口石材 · 義大利吊燈',
      ],
      theme: 'cream',
    },
    {
      id: 'bay-wellness',
      title: 'Wellness',
      tag: 'BODY AS A HOME',
      src: `${this.assetBase}/公設-內部/254.jpg`,
      lede:
        '不必出門，就能在日光裡開始一天。健身、瑜珈、烤箱、SPA——身體的每一處需要，都被理解成住家的一部分。挑高採光的室內泳池，水波折射出整面天光。',
      stats: [
        '25 米恆溫泳池',
        '私人健身房 · 瑜珈室',
        '蒸氣 · 烤箱 · SPA',
        '景觀露天按摩池',
      ],
      theme: 'forest',
    },
    {
      id: 'bay-equipment',
      title: 'Equipment',
      tag: 'STANDARD, UNSPOKEN',
      src: `${this.assetBase}/公設-內部/176.jpg`,
      lede:
        '德意原裝廚電、日德並陳衛浴、全屋恆境空調、智慧家居中控。四大系譜，皆為住家而設，不為展示而堆——真正的奢侈，是看不見的標準。',
      stats: [
        'Gaggenau · Miele 廚電',
        'TOTO Neorest · Duravit · GROHE',
        'DAIKIN VRV · ERV 新風系統',
        'Control4 全戶中控',
      ],
      theme: 'umber',
    },
  ];

  readonly navItems: Array<{ id: string; label: string }> = [
    { id: 'trust', label: '甲級精工' },
    { id: 'whynow', label: '水湳願景' },
    { id: 'spec', label: '精工格局' },
    { id: 'design', label: '大師巨作' },
  ];

  readonly walks: Walk[] = [
    { p: '中央公園 · 主入口', m: '步行', n: '03' },
    { p: '全聯福利中心', m: '步行', n: '06' },
    { p: '水湳國小（規劃中）', m: '步行', n: '08' },
    { p: '家樂福 · 西屯店', m: '車行', n: '07' },
    { p: '聯合醫院水湳院區', m: '步行', n: '10' },
    { p: '台中捷運水湳站（綠線延伸）', m: '步行', n: '12' },
  ];

  readonly specCells: SpecCell[] = [
    { k: 'GROUND FLOORS · 地上層數', v: '29', sub: '層' },
    { k: 'BELOW GROUND · 地下層數', v: '03', sub: '地下三層 · 車位 248' },
    { k: 'TOTAL UNITS · 總戶數', v: '186', sub: '戶 · 不多不少' },
    { k: 'AREA RANGE · 坪數範圍', v: '47 / 52', sub: '坪 · 建坪計' },
    { k: 'LAYOUT · 格局', v: '三房', sub: '兩款；雙衛皆開窗' },
    { k: 'HANDOVER · 預計交屋', v: '2027', sub: '預計交屋年' },
  ];

  readonly layoutOptions: Array<{ v: '47' | '52' | 'any'; l: string }> = [
    { v: '47', l: '47 坪 · 精準' },
    { v: '52', l: '52 坪 · 餘裕' },
    { v: 'any', l: '都看看' },
  ];

  readonly purposeOptions: Array<{ v: 'self' | 'asset' | 'tbd'; l: string }> = [
    { v: 'self', l: '自住' },
    { v: 'asset', l: '資產配置' },
    { v: 'tbd', l: '尚未確定' },
  ];

  private gsapCtx?: gsap.Context;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private host: ElementRef<HTMLElement>,
  ) {
    super(injector);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    setTimeout(() => this.onScroll(), 0);
    this.initAnimations();
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }

  private initAnimations(): void {
    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const root = this.host.nativeElement;
    const ease = 'power3.out';

    this.gsapCtx = gsap.context(() => {
      // ───── Hero entrance ─────
      const heroTl = gsap.timeline({ defaults: { ease, duration: 1.1 } });
      heroTl
        .from('.hero .hero-bg', { scale: 1.08, opacity: 0, duration: 1.6, ease: 'power2.out' }, 0)
        .from('.hero .hero-title', { y: 36, opacity: 0, duration: 1.2 }, '-=1.0')
        .from('.hero .hero-lede > *', { y: 16, opacity: 0, stagger: 0.12, duration: 0.7 }, '-=0.6')
        .from('.hero .scroll-cue', { opacity: 0, y: 12, duration: 0.6 }, '-=0.4');

      // ───── Hero image parallax ─────
      gsap.to('.hero .hero-bg', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      // ───── Hero content exit lift ─────
      // Lift content up & dim opacity while hero scrolls out — 避免硬切到下一節
      gsap.to('.hero .hero-content', {
        yPercent: -22,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
      });

      // Vignette 在 hero 退場時加深，與下一節米色形成柔焦
      gsap.to('.hero .hero-vignette', {
        opacity: 1.6,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: 0.6 },
      });

      // ───── DISTRICT INTRO · pin + 四圖飛入 ─────
      const diSection = root.querySelector<HTMLElement>('.district-intro');
      const diCanvas  = root.querySelector<HTMLElement>('.district-intro .di-canvas');
      if (diSection && diCanvas) {
        const diImgs     = gsap.utils.toArray<HTMLElement>('.district-intro .di-img');
        const diHeadline = root.querySelector<HTMLElement>('.district-intro .di-headline');
        const isMobile   = window.matchMedia('(max-width: 768px)').matches;

        if (!isMobile) {
          // 初始態：圖片偏移到邊緣之外，標題透明，veil 透明
          const offsets: Record<string, { x: number; y: number }> = {
            'di-img--tl': { x: -120, y: -60 },
            'di-img--tr': { x:  120, y: -80 },
            'di-img--bl': { x: -100, y:  80 },
            'di-img--br': { x:  100, y:  60 },
          };
          diImgs.forEach((img) => {
            const key = Object.keys(offsets).find((k) => img.classList.contains(k));
            const off = key ? offsets[key] : { x: 0, y: 60 };
            gsap.set(img, { x: off.x, y: off.y, opacity: 0 });
          });
          if (diHeadline) gsap.set(diHeadline, { opacity: 0, yPercent: 6 });

          // ── Pre-pin entry parallax ──
          // section 在 pin 啟動前先做整塊 yPercent 滑入 + 淡入，
          // 吃掉「米色 bg 已就位但內容還沒進場」的空白感
          gsap.fromTo(
            diCanvas,
            { yPercent: 14, opacity: 0.55 },
            {
              yPercent: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: diSection,
                start: 'top bottom',
                end: 'top top',
                scrub: 0.6,
              },
            },
          );

          // 建立 pinned timeline（縮為 1.4× vh，移除尾段純停留）
          const diTl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: diSection,
              start: 'top top',
              end: () => `+=${window.innerHeight * 1.4}`,
              pin: true,
              pinSpacing: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // 圖片飛入（前段 0 → 0.55）
          diImgs.forEach((img, i) => {
            diTl.to(img, { x: 0, y: 0, opacity: 1, duration: 0.4 }, i * 0.08);
          });
          // 標題滑入（中段 0.25 → 0.55）
          if (diHeadline) {
            diTl.to(diHeadline, { opacity: 1, yPercent: 0, duration: 0.3 }, 0.25);
          }

          // ── Outro：pin 末段（0.65 → 1.0）做 parallax 退場 ──
          // 整塊 canvas 上推 + 圖片 zoom out 淡出 + 標題向上飄走 + 深藍 veil 同步覆蓋
          // 模擬截圖中「上一節 parallax 退場」感
          diTl.to(diCanvas, { yPercent: -22, ease: 'power2.in', duration: 0.35 }, 0.65);
          diTl.to(diImgs, {
            scale: 1.18,
            opacity: 0,
            ease: 'power2.in',
            duration: 0.3,
            stagger: 0.03,
          }, 0.65);
          if (diHeadline) {
            diTl.to(diHeadline, { opacity: 0, yPercent: -45, ease: 'power2.in', duration: 0.3 }, 0.7);
          }
          diTl.to('.district-intro .di-exit-veil', { opacity: 1, ease: 'power1.in', duration: 0.35 }, 0.65);
        } else {
          // Mobile：簡單淡入，不做 pin
          if (diHeadline) gsap.set(diHeadline, { opacity: 0, y: 24 });
          diImgs.forEach((img) => gsap.set(img, { opacity: 0, y: 30 }));
          diImgs.forEach((img, i) => {
            gsap.to(img, {
              opacity: 1, y: 0, duration: 0.9, ease,
              scrollTrigger: { trigger: diSection, start: 'top 85%', toggleActions: 'play none none none' },
              delay: i * 0.1,
            });
          });
          if (diHeadline) {
            gsap.to(diHeadline, {
              opacity: 1, y: 0, duration: 1, ease,
              scrollTrigger: { trigger: diSection, start: 'top 80%', toggleActions: 'play none none none' },
            });
          }
        }
      }

      // ───── THE CRAFT (甲級營造) reveals ─────
      gsap.from('.craft .craft-anchor', {
        opacity: 0, y: 36, duration: 1.2, ease,
        scrollTrigger: { trigger: '.craft .craft-anchor', start: 'top 85%', toggleActions: 'play none none none' },
      });
      gsap.from('.craft .craft-hero img', {
        scale: 1.12, opacity: 0.4, duration: 2, ease: 'power2.out',
        scrollTrigger: { trigger: '.craft .craft-hero', start: 'top 85%', toggleActions: 'play none none none' },
      });

      // ───── SPRINGS BAYS — pin container + vertical slide-up storytelling ─────
      // The whole .springs-bays container is pinned for 500vh of scroll.
      // Bays are absolutely positioned on top of each other; bays 2..n start
      // translated 100% below viewport, then slide up to translateY:0 during
      // their assigned scroll segment. Reveal staggers fire per-segment.
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const baysContainer = root.querySelector<HTMLElement>('.springs-bays');
      const bays = gsap.utils.toArray<HTMLElement>('.springs-bays .sb-bay');

      if (baysContainer && bays.length) {
        if (isMobile) {
          // Mobile: simple fade-in per bay, no pin/scrub.
          bays.forEach((bay) => {
            const panel = bay.querySelector<HTMLElement>('.sb-panel');
            const stats = bay.querySelectorAll<HTMLElement>('.sb-stats li');
            if (panel) gsap.from(panel, {
              opacity: 0, y: 24, duration: 1, ease,
              scrollTrigger: { trigger: bay, start: 'top 80%', toggleActions: 'play none none none' },
            });
            if (stats.length) gsap.from(stats, {
              opacity: 0, y: 20, stagger: 0.1, duration: 0.8, ease,
              scrollTrigger: { trigger: bay, start: 'top 75%', toggleActions: 'play none none none' },
            });
          });
        } else {
          // ── Initial state: bays 2..n parked below viewport ──
          bays.forEach((bay, i) => {
            if (i > 0) gsap.set(bay, { yPercent: 100 });
          });

          // ── Each bay's intro elements (title / lede / stats) start hidden ──
          bays.forEach((bay) => {
            const title = bay.querySelector<HTMLElement>('.sb-title');
            const lede = bay.querySelector<HTMLElement>('.sb-lede');
            const stats = bay.querySelectorAll<HTMLElement>('.sb-stats li');
            if (title) gsap.set(title, { y: 40, opacity: 0 });
            if (lede) gsap.set(lede, { opacity: 0, y: 24 });
            if (stats.length) gsap.set(stats, { opacity: 0, y: 28 });
          });

          // ── Master pinned timeline ──
          // Choreography per "slot" of 1 × viewport scroll:
          //   slot 0 (dwell)        : bay 1 reveal (title/lede/stats)
          //   slot 1 (transition)   : bay 2 slides up over bay 1
          //   slot 2 (dwell)        : bay 2 reveal
          //   slot 3 (transition)   : bay 3 slides up over bay 2
          //   slot 4 (dwell)        : bay 3 reveal
          const slots = Math.max(3, bays.length * 2 - 1); // 5 for 3 bays
          const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: baysContainer,
              start: 'top top',
              end: () => `+=${window.innerHeight * slots}`,
              pin: true,
              pinSpacing: true,
              scrub: 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          bays.forEach((bay, i) => {
            const title = bay.querySelector<HTMLElement>('.sb-title');
            const lede = bay.querySelector<HTMLElement>('.sb-lede');
            const stats = bay.querySelectorAll<HTMLElement>('.sb-stats li');

            // For bay i:
            //   reveal slot = 2 * i
            //   slide-in slot (for bay i > 0) = 2 * i - 1
            const revealStart = 2 * i;

            if (i > 0) {
              const slideStart = 2 * i - 1;
              tl.to(bay, { yPercent: 0, duration: 1, ease: 'power3.out' }, slideStart);
            }

            // Reveal sequence within the dwell slot
            if (title) tl.to(title, { y: 0, opacity: 1, duration: 0.6 }, revealStart);
            if (lede) tl.to(lede, { opacity: 1, y: 0, duration: 0.5 }, revealStart + 0.15);
            if (stats.length) tl.to(stats, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, revealStart + 0.3);

            // Small "stay" tween so the slot consumes ~1 unit of scroll
            tl.to({}, { duration: 0.5 }, revealStart + 0.5);
          });
        }
      }

      // ───── Section entry parallax — opacity scrub composes with CSS bg bridges ─────
      // 每個 section 進場時，主內容 opacity 由 0.25 漸入至 1，
      // 跟 SCSS 頂部 gradient bridge 一起作用，提供 parallax 切換感。
      // 只動 opacity 不動 transform，避免影響 .col-narrow 的 sticky 行為。
      const sectionEntries: Array<[string, string]> = [
        ['.trust', '.trust .builder-deep'],
        ['#whynow', '#whynow .inner'],
        ['.spec', '.spec .head'],
        ['.design', '.design .inner'],
        ['.contact', '.contact .pre'],
      ];
      sectionEntries.forEach(([trigger, target]) => {
        const el = root.querySelector<HTMLElement>(target);
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0.25 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top 90%',
              end: 'top 50%',
              scrub: 0.7,
            },
          },
        );
      });

      // ───── Generic section reveal ─────
      const revealSelectors = [
        '.trust .trust-head',
        '.trust .trust-grid > .cell',
        '.trust .lineage',
        '.builder-deep .anchor-q',
        '.builder-deep .builder-body .bd-essay',
        '.builder-deep .bd-right .bd-stat',
        '.builder-deep .bd-works-head',
        '.builder-deep .bd-work',
        '.builder-deep .bd-final',
        '#whynow .col-narrow > *',
        '.walk .left > *',
        '.walk .list .row',
        '.spec .head > *',
        '.spec .grid .cell',
        '.spec .pull-wrap > *',
        '.spec .layouts .lt',
        '.design .col-narrow > *',
        '.design .building-shot',
        '.design .arc-essay > *',
        '.contact .pre > *',
        '.contact .form .field',
        '.contact .form .submit',
        '.contact .info .blk',
        '.contact .info .map',
        '.contact .footer-bar',
      ];

      revealSelectors.forEach((sel) => {
        gsap.utils.toArray<HTMLElement>(sel).forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 28,
            duration: 1,
            ease,
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          });
        });
      });

      // ───── Image zoom-out on scroll-in ─────
      gsap.utils.toArray<HTMLElement>('.bd-img .ph-img, .group-img .ph-img, .building-shot .ph-img').forEach((img) => {
        gsap.from(img, {
          scale: 1.12,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: img, start: 'top 92%', toggleActions: 'play none none none' },
        });
      });

      // ───── Spec value emphasise ─────
      gsap.utils.toArray<HTMLElement>('.spec .grid .cell .v').forEach((v) => {
        gsap.from(v, {
          opacity: 0,
          y: 32,
          letterSpacing: '0.18em',
          duration: 1.2,
          ease,
          scrollTrigger: { trigger: v, start: 'top 85%', toggleActions: 'play none none none' },
        });
      });

      // ───── Building-shot quote subtle rise ─────
      gsap.from('.design .building-shot .quote-overlay .q', {
        y: 40, opacity: 0, duration: 1.4, ease,
        scrollTrigger: {
          trigger: '.design .building-shot', start: 'top 70%', toggleActions: 'play none none none',
        },
      });

      // Refresh after fonts/layout settle
      setTimeout(() => ScrollTrigger.refresh(), 250);
    }, root);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (typeof window === 'undefined') return;
    const y = window.scrollY;
    this.scrolled = y > 40;
    this.pastHero = y > window.innerHeight * 0.6;

    const ids = ['hero', 'trust', 'whynow', 'spec', 'springs-bays', 'design', 'contact'];
    let cur = 'hero';
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) cur = id;
    }
    this.active = cur;
    this.cdr.markForCheck();
  }

  scrollToId(id: string, offset = 20): void {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
  }

  trackByIndex(index: number): number { return index; }

  splitSpecValue(v: string): string[] { return v.split(' / '); }

  submit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
  }
}
