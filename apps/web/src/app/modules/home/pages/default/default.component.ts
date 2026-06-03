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

interface Walk {
  p: string;
  m: string;
  n: string;
}
interface SpecCell {
  k: string;
  v: string;
  sub: string;
}

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
})
export class DefaultComponent
  extends BBDBaseComponent
  implements AfterViewInit, OnDestroy
{
  scrolled = false;
  pastHero = false;
  active = 'hero';

  layout: '47' | '52' | 'any' = 'any';
  purpose: 'self' | 'asset' | 'tbd' = 'self';
  submitted = false;

  readonly assetBase = 'assets/image';
  readonly img = {
    hero: `${this.assetBase}/photo/hero-bg.webp`,
    map: `${this.assetBase}/map/contact-map.webp`,
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
      id: 'bay-sanctuary',
      title: 'Sanctuary',
      tag: 'A DAILY RETURN TO SELF',
      src: `${this.assetBase}/photo/toto-main.jpg`,
      lede: '以 TOTO 全系列精工衛浴，重新定義沐浴的儀式感。智能馬桶、豪華浴缸、四合一暖風機，每一件配備皆源自對生活品質的嚴謹堅持——洗浴不再只是日常清潔，而是每日可以期待的私人療癒時光。',
      stats: [
        'TOTO 全自動智能馬桶 · 一體成型免縫設計',
        'GROHE 定溫花灑 · SmartControl 智慧恆溫',
        'TOTO 豪華浴缸 · 三孔混合加工高光澤工藝',
        'TOTO 四合一暖風機 · 20 分鐘極速升溫',
        'TOTO 下嵌式面盆 · 通過美日雙重防滲認證',
      ],
      theme: 'cream',
    },
    {
      id: 'bay-kitchen',
      title: 'Kitchen',
      tag: 'WHERE CRAFT BECOMES RITUAL',
      src: `${this.assetBase}/photo/stosa-main.jpg`,
      lede: '引進義大利 STOSA 頂級廚具，搭配 BOSCH、SAKURA 旗艦廚電，SILESTONE 賽麗石無縫延伸料理台面。從動線規劃到收納美學，每個細節都為真正懂廚房的人而生——讓烹飪成為一種日常的儀式感。',
      stats: [
        'STOSA 義大利廚具 · 創立逾 164 年歐洲頂級品牌',
        'SILESTONE 賽麗石檯面 · 超硬度抗刮耐熱',
        'BOSCH IH 感應爐 · CHOTT 陶瓷面板智慧滾沸偵測',
        'BOSCH 全嵌式洗碗機 · 70°C 高溫殺菌 AquaStop 防漏',
        'SAKURA 近吸式排油煙機 · 專為台灣料理習慣設計',
      ],
      theme: 'umber',
    },
    /*
    {
      id: 'bay-amenities',
      title: 'Amenities',
      tag: 'LIFE ELEVATED BEYOND THE UNIT',
      src: `${this.assetBase}/photo/skylounge-main.jpg`,
      lede: '走出家門，生活仍在延伸。從幾何光影門廳到頂樓 Sky Lounge，從無邊際泳池到私人影院，每一處公共空間都以飯店規格設計——讓日常成為度假，讓棟內即是目的地。',
      stats: [
        'Sky Lounge 頂樓天空酒廊 · 金色弧形吧台環繞城市天際線',
        '戶外無邊際泳池 · 櫻花樹列陣四季皆景',
        'Theater 私人影音室 · 弧形穹頂沉浸式視聽',
        '食藝空間 · 大理石中島專業廚房可宴客',
        '森序庭園 · 蜿蜒步道穿越喬木城市私有森林',
      ],
      theme: 'forest',
    },
    */
   {
  id: 'bay-residence',
  title: 'Residence',
  tag: 'EVERY DETAIL, CONSIDERED',
  src: `${this.assetBase}/photo/vaf-living.jpg`,
  lede:
    '從踏入門的那一刻起，每個選材都在說話。德國太格木地板、日本三協氣密窗、VAF 智慧淨氣、Yale 無感門鎖——全戶標配不為炫耀，而是對真正居住品質的基本堅持。',
  stats: [
    'VAF 智慧浮流系統 · 過濾 PM2.5、黴菌、甲醛',
    '德國太格木地板 · 台灣認證健康材，不含苯、甲醛',
    '日本三協氣密窗 · 橫拉窗整體把手設計，隔音隔熱氣密性卓越',
    'ORLANT 電動曬衣架 · 智慧控制升降',
    'Yale 抗菌電子鎖 · 手機感應解鎖，無實體鑰匙零接觸進門',
  ],
  theme: 'cream',
},
  ];

  readonly navItems: Array<{ id: string; label: string }> = [
    { id: 'location-map', label: '水湳特區' },
    { id: 'trust', label: '甲級精工' },
    { id: 'spec', label: '精工格局' },
    { id: 'springs-bays', label: '生活樣貌' },
    { id: 'design', label: '大師巨作' },
    { id: 'contact', label: '預約鑒賞' },
  ];

  readonly mobileLabels: Record<string, string> = {
    'location-map': '社區',
    trust: '甲級',
    spec: '規格',
    'springs-bays': '樣貌',
    design: '生活',
    contact: '預約',
  };

  mobileHiddenIds = ['location-map', 'trust', 'design'];

  isMobileView(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(max-width: 640px)').matches
    );
  }

  navLabel(item: { id: string; label: string }): string {
    return this.isMobileView() ? this.mobileLabels[item.id] ?? item.label : item.label;
  }

  mobileHidden(id: string): boolean {
    return this.isMobileView() && this.mobileHiddenIds.includes(id);
  }

  readonly walks: Walk[] = [
    { p: '中央公園 · 主入口', m: '步行', n: '03' },
    { p: '全聯福利中心', m: '步行', n: '06' },
    { p: '水湳國小（規劃中）', m: '步行', n: '08' },
    { p: '家樂福 · 西屯店', m: '車行', n: '07' },
    { p: '聯合醫院水湳院區', m: '步行', n: '10' },
    { p: '台中捷運水湳站（綠線延伸）', m: '步行', n: '12' },
  ];

  readonly specCells: SpecCell[] = [
    { k: 'SEISMIC RESISTANCE · 耐震係數', v: '0.34g', sub: '六級耐震設計' },
    { k: 'FOUNDATION DEPTH · 地樑深度', v: '3M', sub: '筏式基礎 · 深根入地' },
    { k: 'EXCAVATION DEPTH · 開挖深度', v: '14.3M', sub: '地下室開挖深度' },
    {
      k: 'REBAR STRENGTH · 鋼筋抗拉',
      v: '4,200',
      sub: 'kg/cm² · 樓版鋼筋強度',
    },
    {
      k: 'SLAB THICKNESS · 樓板厚度',
      v: '15CM',
      sub: '雙層配筋 · 符合 CNS560',
    },
    {
      k: 'CONNECTOR GRADE · 續接器等級',
      v: 'SA級',
      sub: '最高等級鋼筋續接工法',
    },
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
    private host: ElementRef<HTMLElement>
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
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const root = this.host.nativeElement;
    const ease = 'power3.out';

    this.gsapCtx = gsap.context(() => {
      // ───── Hero entrance ─────
      const heroTl = gsap.timeline({ defaults: { ease, duration: 1.1 } });
      heroTl
        .from(
          '.hero .hero-bg',
          { scale: 1.08, opacity: 0, duration: 1.6, ease: 'power2.out' },
          0
        )
        .from(
          '.hero .hero-title',
          { y: 36, opacity: 0, duration: 1.2 },
          '-=1.0'
        )
        .from(
          '.hero .hero-lede > *',
          { y: 16, opacity: 0, stagger: 0.12, duration: 0.7 },
          '-=0.6'
        )
        .from(
          '.hero .scroll-cue',
          { opacity: 0, y: 12, duration: 0.6 },
          '-=0.4'
        );

      // ───── Hero image parallax ─────
      gsap.to('.hero .hero-bg', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // ───── Hero content exit lift ─────
      // Lift content up & dim opacity while hero scrolls out — 避免硬切到下一節
      gsap.to('.hero .hero-content', {
        yPercent: -22,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      // Vignette 在 hero 退場時加深，與下一節米色形成柔焦
      gsap.to('.hero .hero-vignette', {
        opacity: 1.6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'center top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      // ───── DISTRICT INTRO · pin + 四圖飛入 ─────
      const diSection = root.querySelector<HTMLElement>('.district-intro');
      const diCanvas = root.querySelector<HTMLElement>(
        '.district-intro .di-canvas'
      );
      if (diSection && diCanvas) {
        const diImgs = gsap.utils.toArray<HTMLElement>(
          '.district-intro .di-img'
        );
        const diHeadline = root.querySelector<HTMLElement>(
          '.district-intro .di-headline'
        );
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        if (!isMobile) {
          // 初始態：圖片偏移到邊緣之外，標題透明，veil 透明
          const offsets: Record<string, { x: number; y: number }> = {
            'di-img--tl': { x: -120, y: -60 },
            'di-img--tc': { x: 0, y: -90 },
            'di-img--tr': { x: 120, y: -80 },
            'di-img--ml': { x: -90, y: 0 },
            'di-img--mr': { x: 90, y: 0 },
            'di-img--bl': { x: -100, y: 80 },
            'di-img--br': { x: 100, y: 60 },
          };
          diImgs.forEach((img) => {
            const key = Object.keys(offsets).find((k) =>
              img.classList.contains(k)
            );
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
            }
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
            diTl.to(
              diHeadline,
              { opacity: 1, yPercent: 0, duration: 0.3 },
              0.25
            );
          }

          // ── Outro：pin 末段（0.65 → 1.0）做 parallax 退場 ──
          // 整塊 canvas 上推 + 圖片 zoom out 淡出 + 標題向上飄走 + 深藍 veil 同步覆蓋
          // 模擬截圖中「上一節 parallax 退場」感
          diTl.to(
            diCanvas,
            { yPercent: -22, ease: 'power2.in', duration: 0.35 },
            0.65
          );
          diTl.to(
            diImgs,
            {
              scale: 1.18,
              opacity: 0,
              ease: 'power2.in',
              duration: 0.3,
              stagger: 0.03,
            },
            0.65
          );
          if (diHeadline) {
            diTl.to(
              diHeadline,
              { opacity: 0, yPercent: -45, ease: 'power2.in', duration: 0.3 },
              0.7
            );
          }
          diTl.to(
            '.district-intro .di-exit-veil',
            { opacity: 1, ease: 'power1.in', duration: 0.35 },
            0.65
          );
        } else {
          // Mobile：簡單淡入，不做 pin
          if (diHeadline) gsap.set(diHeadline, { opacity: 0, y: 24 });
          diImgs.forEach((img) => gsap.set(img, { opacity: 0, y: 30 }));
          diImgs.forEach((img, i) => {
            gsap.to(img, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease,
              scrollTrigger: {
                trigger: diSection,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              delay: i * 0.1,
            });
          });
          if (diHeadline) {
            gsap.to(diHeadline, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease,
              scrollTrigger: {
                trigger: diSection,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            });
          }
        }
      }

      // ───── THE CRAFT (甲級營造) reveals ─────
      gsap.from('.craft .craft-anchor', {
        opacity: 0,
        y: 36,
        duration: 1.2,
        ease,
        scrollTrigger: {
          trigger: '.craft .craft-anchor',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
      gsap.from('.craft .craft-hero img', {
        scale: 1.12,
        opacity: 0.4,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.craft .craft-hero',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
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
            if (panel)
              gsap.from(panel, {
                opacity: 0,
                y: 24,
                duration: 1,
                ease,
                scrollTrigger: {
                  trigger: bay,
                  start: 'top 80%',
                  toggleActions: 'play none none none',
                },
              });
            if (stats.length)
              gsap.from(stats, {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                ease,
                scrollTrigger: {
                  trigger: bay,
                  start: 'top 75%',
                  toggleActions: 'play none none none',
                },
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
              tl.to(
                bay,
                { yPercent: 0, duration: 1, ease: 'power3.out' },
                slideStart
              );
            }

            // Reveal sequence within the dwell slot
            if (title)
              tl.to(title, { y: 0, opacity: 1, duration: 0.6 }, revealStart);
            if (lede)
              tl.to(
                lede,
                { opacity: 1, y: 0, duration: 0.5 },
                revealStart + 0.15
              );
            if (stats.length)
              tl.to(
                stats,
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                revealStart + 0.3
              );

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
        ['#design', '#design .inner'],
        ['#design-b', '#design-b .inner'],
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
          }
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
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          });
        });
      });

      // ───── Image zoom-out on scroll-in ─────
      gsap.utils
        .toArray<HTMLElement>(
          '.bd-img .ph-img, .group-img .ph-img'
        )
        .forEach((img) => {
          gsap.from(img, {
            scale: 1.12,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: img,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
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
          scrollTrigger: {
            trigger: v,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      // ───── Design sections — video card fade-in + staggered autoplay ─────
      (
        [['#design', 0.25, 350], ['#design-b', 0.2, 250]] as [string, number, number][]
      ).forEach(([sectionId, stagger, delay]) => {
        const cards = gsap.utils.toArray<HTMLElement>(`${sectionId} .vg-card`);
        if (!cards.length) return;
        gsap.from(cards, {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: 'power2.out',
          stagger,
          scrollTrigger: {
            trigger: sectionId,
            start: 'top 75%',
            toggleActions: 'play none none none',
            onEnter: () => {
              const videos = Array.from(
                document.querySelectorAll<HTMLVideoElement>(`${sectionId} video`)
              );
              videos.forEach((v, i) =>
                gsap.delayedCall(i * delay / 1000, () => v.play().catch(() => void 0))
              );
            },
          },
        });
      });

      // ── Refresh after fonts/layout settle ──
      // 兩個關鍵動作：
      // 1. 等 layout 設完（fonts/images），再做一次 layout-aware refresh
      // 2. **逐個 instance 呼叫 .refresh()**：GSAP static refresh() 有個 bug，
      //    對於 cross-component pin（如 child component 的 ScrollTrigger 在 parent
      //    建立 pin-spacer 前先 init），static refresh 不會重新偵測 spacer
      //    影響後續 trigger 的位置。必須逐個 instance refresh 才會修正 start/end。
      //    （location-map 的 lm-stage pin 起始位置就因此偏早 1260px = district
      //    pin-spacer 高度）
      const refreshAll = () => {
        ScrollTrigger.getAll().forEach((t) => t.refresh());
      };
      // 第一輪：等 fonts/img 載完
      setTimeout(refreshAll, 300);
      // 第二輪：保險，等 hero 圖片 decode 完
      setTimeout(refreshAll, 1000);
    }, root);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (typeof window === 'undefined') return;
    const y = window.scrollY;
    this.scrolled = y > 40;
    this.pastHero = y > window.innerHeight * 0.6;

    const ids = [
      'hero',
      'trust',
      'whynow',
      'spec',
      'springs-bays',
      'design',
      'contact',
    ];
    let cur = 'hero';
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35)
        cur = id;
    }
    this.active = cur;
    this.cdr.markForCheck();
  }

  scrollToId(id: string, offset = 20): void {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
  }

  trackByIndex(index: number): number {
    return index;
  }

  splitSpecValue(v: string): string[] {
    return v.split(' / ');
  }

  submit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
  }
}
