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
  id: 'bay-residence',
  title: '全屋',
  tag: '細節成就完美',
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
    {
      id: 'bay-sanctuary',
      title: '浴室',
      tag: '日常淨心儀式',
      src: `${this.assetBase}/photo/toto-main.jpg`,
      lede: '以 TOTO 全系列精工衛浴，重新定義沐浴的儀式感。智能馬桶、豪華浴缸、四合一暖風機，每一件配備皆源自對生活品質的嚴謹堅持——洗浴不再只是日常清潔，而是每日可以期待的私人療癒時光。',
      stats: [
        'TOTO 全自動智能馬桶 · 一體成型免縫設計',
        'GROHE 定溫花灑 · SmartControl 智慧恆溫',
        'TOTO 豪華浴缸 · 三孔混合加工高光澤工藝',
        'TOTO 四合一暖風機 · 20 分鐘極速升溫',
        'TOTO 下嵌式面盆 · 美日雙重防滲認證',
      ],
      theme: 'cream',
    },
    {
      id: 'bay-kitchen',
      title: '廚房',
      tag: '烹飪成為藝術',
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
    { k: '耐震係數', v: '0.34g', sub: '六級耐震設計' },
    { k: '地樑深度', v: '3M', sub: '筏式基礎 · 深根入地' },
    { k: '開挖深度', v: '14.3M', sub: '地下室開挖深度' },
    {
      k: '鋼筋抗拉',
      v: '4,200',
      sub: 'kg/cm² · 樓版鋼筋強度',
    },
    {
      k: '樓板厚度',
      v: '15CM',
      sub: '雙層配筋 · 符合 CNS560',
    },
    {
      k: '續接器等級',
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
          // 初始態：壓低、透明，進場用單純 fade + 上滑（與 .sb-bay 一致）
          diImgs.forEach((img) => {
            gsap.set(img, { opacity: 0, y: 44 });
          });
          if (diHeadline) gsap.set(diHeadline, { opacity: 0, yPercent: 6 });

          // ── Pre-pin entry：section 進入視窗 1/4 (top 75%) 起算 ──
          // 到 pin 啟動 (top top) 完成：整塊 canvas 滑入淡入，
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
                start: 'top 75%',
                end: 'top top',
                scrub: 0.6,
              },
            }
          );

          // 進場序列（對應草圖出現順序，diImgs 依 DOM 順序即 01→05 = 圖1→圖5）：
          // 圖1(右上) → 圖2(中上) →【中間文字第 3 個出現】→ 圖3(左中) → 圖4(右下) → 圖5(中下)
          // 與上方 canvas 滑入同步，於 top 75% → top top 區間 scrub 完成，
          // 避免內容在進場期間長時間維持 opacity:0 的空白
          const entryStep = 0.05;
          // 圖1 之後（圖2-5、標題）額外延遲一點點進場，與圖1錯開更明顯
          const lateDelay = 0.04;
          const entryTl = gsap.timeline({
            scrollTrigger: {
              trigger: diSection,
              start: 'top 75%',
              end: 'top top',
              scrub: 0.6,
            },
          });
          const revealEntry = (img: HTMLElement, slot: number) =>
            entryTl.to(
              img,
              { opacity: 1, y: 0, duration: 0.19, ease: 'power2.out' },
              slot === 0 ? 0 : slot * entryStep + lateDelay
            );

          revealEntry(diImgs[0], 0); // 圖1 · 右上
          revealEntry(diImgs[1], 1); // 圖2 · 中上
          if (diHeadline) {
            // 中間文字 · 第 3 個出現（夾在 圖2 與 圖3 之間）
            entryTl.to(
              diHeadline,
              { opacity: 1, yPercent: 0, duration: 0.16, ease: 'power2.out' },
              2 * entryStep + lateDelay
            );
          }
          revealEntry(diImgs[2], 3); // 圖3 · 左中
          revealEntry(diImgs[3], 4); // 圖4 · 右下
          revealEntry(diImgs[4], 5); // 圖5 · 中下

          // 建立 pinned timeline（拉長為 2.0× vh ≈ 200svh）
          // 節奏：全程 parallax 視差 → 定格 hold(0.45→0.72) → 緩慢退場(0.72→1.0)
          // （圖片/標題進場已於 pin 前的 entryTl 階段完成）
          const diTl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
              trigger: diSection,
              start: 'top top',
              end: () => `+=${window.innerHeight * 1.5}`,
              pin: true,
              pinSpacing: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Parallax：各圖以不同幅度持續上飄（用 yPercent，與進場的 y/opacity
          // 為獨立 transform 分量、互不覆蓋），全程隨 scrub 連動 → 景深視差
          const parallax: Record<string, number> = {
            'di-img--01': -4,
            'di-img--02': -2,
            'di-img--03': -7,
            'di-img--04': -5,
            'di-img--05': -8,
          };
          diImgs.forEach((img) => {
            const key = Object.keys(parallax).find((k) =>
              img.classList.contains(k)
            );
            const depth = key ? parallax[key] : -10;
            diTl.to(img, { yPercent: depth, ease: 'none', duration: 1 }, 0);
          });

          // ── 定格 hold（0.45 → 0.72）──
          // 全部圖片與標題就位後，timeline 此段刻意留白且加長，
          // scrub 滑過時畫面完全凍結，給足更長的「全員定格」停留，
          // 再進入退場、銜接下一節 location-map
          diTl.to({}, { duration: 0.27 }, 0.45);

          // ── Outro：pin 末段（0.72 → 1.0）緩慢退場 ──
          // 整塊 canvas 上推 + 圖片 zoom out 淡出 + 標題向上飄走 + 深藍 veil 同步覆蓋
          // 退場區段加長 → location-map（同深藍）覆蓋上來更慢、更從容
          diTl.to(
            diCanvas,
            { yPercent: -22, ease: 'power2.in', duration: 0.28 },
            0.72
          );
          diTl.to(
            diImgs,
            {
              scale: 1.18,
              opacity: 0,
              ease: 'power2.in',
              duration: 0.26,
              stagger: 0.02,
            },
            0.72
          );
          if (diHeadline) {
            diTl.to(
              diHeadline,
              { opacity: 0, yPercent: -45, ease: 'power2.in', duration: 0.26 },
              0.74
            );
          }
          diTl.to(
            '.district-intro .di-exit-veil',
            { opacity: 1, ease: 'power1.in', duration: 0.28 },
            0.72
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

      // ───── BUILDER-DEEP (甲級精工) — parallax bg + sticky 左文 + 卡片淡入 ─────
      const bdSection = root.querySelector<HTMLElement>('.builder-deep');
      if (bdSection) {
        const bdBg = bdSection.querySelector<HTMLElement>('.bd-bg');
        const bdLeft = bdSection.querySelector<HTMLElement>('.bd-essay-wrap');
        const bdStats = gsap.utils.toArray<HTMLElement>('.builder-deep .bd-stat');

        // 背景 parallax：整段捲動期間背景緩慢位移（bg 層較容器高 → 不露邊）
        if (bdBg) {
          gsap.to(bdBg, {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: bdSection,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        }

        // 左下文字：捲到此 section 約 1/3 才淡入（只 fade、不位移）
        if (bdLeft) {
          gsap.fromTo(
            bdLeft,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1.1,
              ease,
              scrollTrigger: {
                trigger: bdSection,
                start: () => `top+=${bdSection.offsetHeight / 3} top`,
                toggleActions: 'play none none reverse',
                invalidateOnRefresh: true,
              },
            }
          );
        }

        // 右側毛玻璃卡片：各自進場時輕輕淡入上滑
        bdStats.forEach((card) => {
          gsap.from(card, {
            opacity: 0,
            y: 36,
            duration: 1,
            ease,
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          });
        });
      }


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
              tl.to(title, { y: 0, opacity: 1, duration: 0.6 }, revealStart - 0.7 );
            if (lede)
              tl.to(
                lede,
                { opacity: 1, y: 0, duration: 0.28 },
                revealStart - 0.4
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
        '.builder-deep .bd-works-head',
        '.builder-deep .bd-work',
        '.builder-deep .bd-final',
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
            start: 'top 90%',
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
