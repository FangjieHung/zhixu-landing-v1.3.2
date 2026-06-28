import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BBDBaseComponent } from '@core/shared';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SwiperOptions } from 'swiper';
import { PrivacyPolicyDialogComponent } from '../../components/privacy-policy-dialog/privacy-policy-dialog.component';

declare global {
  interface Window {
    // GTM（GTM-N7VRTZLB）的資料層；GTM 主腳本載入前可能尚未建立。
    dataLayer?: Record<string, unknown>[];
  }
}

interface Walk {
  p: string;
  m: string;
  n: string;
}

/** 設施影片片段：catalog 區塊的 swiper 投影片 + 右上分頁標籤共用資料源 */
interface FacilityClip {
  /** 行動裝置／窄螢幕用的較小檔案 */
  src: string;
  /** 桌面寬螢幕用的高畫質版本 */
  srcHd: string;
  poster: string;
  caption: string;
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
  implements OnInit, AfterViewInit, OnDestroy
{
  scrolled = false;
  pastHero = false;
  active = 'hero';

  layout: '47' | '52' | 'any' = 'any';
  purpose: 'self' | 'asset' | 'tbd' = 'self';
  submitted = false;

  /** 聯絡表單：點送出才驗證，欄位以 mat-error 呈現；隱私權需勾選同意 */
  readonly contactForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9\s-]+$/)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', { nonNullable: true }),
    agreedPrivacy: new FormControl(false, {
      nonNullable: true,
      validators: Validators.requiredTrue,
    }),
  });

  readonly assetBase = 'assets/image';
  readonly img = {
    hero: `${this.assetBase}/photo/hero-landscpae.webp`,
    map: `${this.assetBase}/map/contact-map.webp`,
  };

  readonly springsBaysSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    grabCursor: true,
    speed: 800,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
    },
    observer: true,
    observeParents: true,
  };

  /**
   * Hero 圖層堆疊（由下而上）：背景風景 → 標題字（display-01/02 包成 hero-title）→ 前景建築。
   * 四張同尺寸（1672×941）全幅圖層，疊在一起構成有景深的主視覺。
   */
  readonly heroLayers = {
    background: `${this.assetBase}/photo/hero-landscpae_background.webp`,
    display01: `${this.assetBase}/photo/hero-landscpae_display-01.webp`,
    display02: `${this.assetBase}/photo/hero-landscpae_display-02.webp`,
    buildings: `${this.assetBase}/photo/hero-landscpae_buildings.webp`,
  };

  /**
   * Springs-style split-bay showcase (image-left / coloured-panel-right, pinned + parallax).
   */
  readonly springsBays: Array<{
    id: string;
    title: string;
    tag: string;
    src: string;
    /** 每個元素＝一行（可斷句排版），模板逐行輸出 */
    lede: string[];
    stats: string[];
    theme: 'cream' | 'forest' | 'umber';
  }> = [
    {
      id: 'bay-residence',
      title: '在容易忽略的地方，體貼著所有的細微感知。',
      tag: '細節成就完美',
      src: `${this.assetBase}/photo/vaf-living.webp`,
      lede: [
        '從踏入門的那一刻起，每個選材都在說話。',
        '德國太格木地板、日本三協氣密窗、VAF 智慧淨氣、Yale 無感門鎖——',
        '全戶標配不為炫耀，而是對真正居住品質的基本堅持。',
      ],
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
      src: `${this.assetBase}/photo/toto-main.webp`,
      lede: [
        '無需試探、不必等待，用恰到好處的淋浴溫度喚醒感官，',
        '這一刻自然鬆開、緩緩融化。',
        '每天在回到家後，都能在這裡，真正地療癒一天的疲憊。',
      ],
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
      src: `${this.assetBase}/photo/stosa-main.webp`,
      lede: [
        '當洗碗機溫柔承接了杯盤狼藉後的鬆弛，暖盤機悄悄溫熱著器皿，',
        '這些體貼入微的細節，讓料理回歸最本質的模樣：',
        '輕鬆、從容，享受全然被療癒的料理時光。',
      ],
      stats: [
        'STOSA 義大利廚具 · 創立逾 164 年歐洲頂級品牌',
        'SILESTONE 賽麗石檯面 · 超硬度抗刮耐熱',
        'BOSCH IH 感應爐 · CHOTT 陶瓷面板智慧滾沸偵測',
        'BOSCH 全嵌式洗碗機 · 70°C 高溫殺菌 AquaStop 防漏',
        'SAKURA 近吸式排油煙機 · 專為台灣料理習慣設計',
      ],
      theme: 'umber',
    },
  ];

  /**
   * 甲級精工 #trust：頂部兩則信任主張（標題＋說明）＋ 下方四格實績展示。
   * 仿截圖排版：暗底主張橫列 → 四欄等寬深色影像（序號＋品牌＋側邊直書標籤）。
   */
  readonly precisionPoints: Array<{ title: string; desc: string }> = [
    {
      title: '國家級甲級營造',
      desc: '以承攬國家公共工程的最高嚴苛標準，把關結構的每一道細節，為您與家人築起足以傳承世代的安心基石。',
    },
    {
      title: '工地高標準領先業界',
      desc: '2009 年起率先推行 24 小時全面監控，更堅持材料進場全數嚴格抽檢。',
    },
  ];

  /** 四格實績影像（暫用既有素材，可日後替換為實際工程照） */
  readonly precisionShowcase: Array<{ no: string; src: string; tag: string }> =
    [
      {
        no: '01',
        src: `${this.assetBase}/showcase/precision-01.webp`,
        tag: '天匯',
      },
      {
        no: '02',
        src: `${this.assetBase}/showcase/precision-02.webp`,
        tag: '心之所向',
      },
      {
        no: '03',
        src: `${this.assetBase}/showcase/precision-03.webp`,
        tag: '織築',
      },
      {
        no: '04',
        src: `${this.assetBase}/showcase/precision-04.webp`,
        tag: '澐光',
      },
    ];

  /**
   * 常見問答（#faq）。內容須與 index.html 的 FAQPage JSON-LD 文字一致，
   * 這是 AEO（答案引擎最佳化）的核心：把買方最常拿來比較的事實「文字化」，
   * 讓 AI 與搜尋引擎能直接讀取、引用、推薦。
   */
  readonly faqs: Array<{ q: string; a: string }> = [
    {
    q: '如何選擇「之序」大三房產品？47 坪與 52 坪有哪些格局優勢與置產建議？',
    a: '【47 坪三房】主打精品自住，格局方正且雙衛浴皆開窗，採光直進不折，是中科菁英與設計師的黃金首選；【52 坪三房】專為傳產二代與換屋族設計，升等尊榮雙主臥，並拉大寬景陽台尺度、無縫引入四季綠意。偏好獨立隱私與開闊渡假感者，建議選擇 52 坪一次到位。'
  },
  {
    q: '為什麼水湳重劃區「之序」會成為中科菁英與自住客的置產首選？',
    a: '水湳「之序」鄰近中央公園綠帶，社區由八成中科工程師與自住換屋族組成，鄰里質地純粹。不同於市場盲從投資熱潮，「之序」凌空大 4 房單價與空間比更具剛需優勢，且由半世紀資歷的甲級總太營造承攬，導入 BIM 科技工程管理，滿足科技菁英對極致結構品質的追求，是一步到位的傳家首選。'
  },
  {
    q: '「之序」在去投資化的純自住定位上，具備哪些稀缺的資產價值？',
    a: '「之序」專為純自住、傳產二代與接班企業主打造，有效排除短線投資型買盤。社區鄰里多為科技新貴與質感設計師，千金買鄰。其高樓層大 4 房的傳家格局，不僅是三代同堂的頂級座標，更是高資產族群在大通膨時代，將長線資金安全泊岸水湳核心的稀缺標的。'
  },
  {
    q: '「之序」的超級遊艇流線外型與空間規劃，有何獨特的美學亮點？',
    a: '「之序」打破傳統建築剛硬框架，以「超級遊艇」為外觀流線靈感，呼應中央公園綠海。公設規劃導入遊艇主人艙的奢華內裝與航行甲板渡假感。大 4 房格局將樑柱退縮，創造方正通透的室內尺度與無邊際採光，深受追求極致品味的設計師與頂級自住客推崇。'
  },
  {
    q: '富華創新「之序」的營造團隊實力如何？如何維持超高層建築的精工品質？',
    a: '本案由同集團旗下、近半世紀資歷的「國家認證甲級營造（總太營造）」親自操刀，曾獲國家卓越建設獎與金安獎。自 2009 年起嚴格推行無酒精工地、24h 火警監控與材料全面抽驗，以蓋國家級公共工程與摩天大樓的嚴苛標準打造大 4 房，給予自住客最安心的結構硬實力。'
  },
  ];

  // ───── Catalog 設施展示（#design / #design-b）─────
  /** 影片以 swiper 輪播呈現，右上分頁標籤與目前投影片同步 */
  readonly gardenClips: FacilityClip[] = [
    {
      src: 'assets/video/facilities/sky-garden.webm',
      srcHd: 'assets/video/facilities/sky-garden-hd.webm',
      poster: 'assets/video/facilities/sky-garden.webp',
      caption: '2000 坪四季庭園',
    },
    {
      src: 'assets/video/facilities/entrance.webm',
      srcHd: 'assets/video/facilities/entrance-hd.webm',
      poster: 'assets/video/facilities/entrance.webp',
      caption: '中庭入口',
    },
    {
      src: 'assets/video/facilities/garden-pavilion.webm',
      srcHd: 'assets/video/facilities/garden-pavilion-hd.webm',
      poster: 'assets/video/facilities/garden-pavilion.webp',
      caption: '花園涼亭',
    },
    {
      src: 'assets/video/facilities/pool.webm',
      srcHd: 'assets/video/facilities/pool-hd.webm',
      poster: 'assets/video/facilities/pool.webp',
      caption: '游泳池',
    },
    {
      src: 'assets/video/facilities/yoga-studio.webm',
      srcHd: 'assets/video/facilities/yoga-studio-hd.webm',
      poster: 'assets/video/facilities/yoga-studio.webp',
      caption: '瑜珈教室',
    },
  ];

  readonly lobbyClips: FacilityClip[] = [
    {
      src: 'assets/video/facilities/clubhouse.webm',
      srcHd: 'assets/video/facilities/clubhouse-hd.webm',
      poster: 'assets/video/facilities/clubhouse.webp',
      caption: '會館外觀',
    },
    {
      src: 'assets/video/facilities/main-gate.webm',
      srcHd: 'assets/video/facilities/main-gate-hd.webm',
      poster: 'assets/video/facilities/main-gate.webp',
      caption: '迎賓大廳',
    },
    {
      src: 'assets/video/facilities/restaurant.webm',
      srcHd: 'assets/video/facilities/restaurant-hd.webm',
      poster: 'assets/video/facilities/restaurant.webp',
      caption: '食憩',
    },
    {
      src: 'assets/video/facilities/garden-bar.webm',
      srcHd: 'assets/video/facilities/garden-bar-hd.webm',
      poster: 'assets/video/facilities/garden-bar.webp',
      caption: '庭園酒吧',
    },
    {
      src: 'assets/video/facilities/theater.webm',
      srcHd: 'assets/video/facilities/theater-hd.webm',
      poster: 'assets/video/facilities/theater.webp',
      caption: '多功能視聽室',
    },
    {
      src: 'assets/video/facilities/bar.webm',
      srcHd: 'assets/video/facilities/bar-hd.webm',
      poster: 'assets/video/facilities/bar.webp',
      caption: '星空酒吧',
    },
  ];

  /** ≥960px（桌面寬容器）改用 HD 版影片來源，避免 mobile 版被拉伸糢糊 */
  private readonly isDesktopViewport =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(min-width: 960px)').matches;

  clipSrc(clip: FacilityClip): string {
    return this.isDesktopViewport ? clip.srcHd : clip.src;
  }

  /** catalog 區塊兩個 swiper 共用設定：單張全幅顯示，影片播完才自動切到下一張（見 template 的 (ended)） */
  readonly catalogSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    loop: true,
    grabCursor: true,
    speed: 600,
    watchSlidesProgress: true,
  };

  /** district-intro 三段共用：大圖高低錯落 + 自動輪播 + 無限循環 + 可拖曳 */
  readonly districtSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    spaceBetween: 28,
    grabCursor: true,
    speed: 800,
    //centeredSlides: true,
    watchSlidesProgress: true,
  };

  readonly navItems: Array<{ id: string; label: string }> = [
    { id: 'district-intro', label: '生活樣貌' },
    { id: 'location-map', label: '漫遊水湳' },
    { id: 'design', label: '私藏空間' },
    { id: 'trust', label: '甲級匠心' },
    { id: 'spec', label: '精工格局' },
  ];

  mobileHiddenIds = ['location-map', 'trust', 'design'];

  isMobileView(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(max-width: 640px)').matches
    );
  }

  mobileHidden(id: string): boolean {
    return this.isMobileView() && this.mobileHiddenIds.includes(id);
  }

  /**
   * district 三段 swiper 切換時，依目前 slide 更新該段左下 di-counter is-phrase 文案。
   * data-stops 形如 [{to,lead,note}]：slide 序（1 起算）≤ to 即套用該組詞。
   */
  onDistrictSlide(event: unknown): void {
    const swiper = Array.isArray(event) ? event[0] : (event as { realIndex?: number; el?: HTMLElement });
    const section = swiper?.el?.closest?.('.district-intro') as HTMLElement | null;
    if (!section) return;
    const counter = section.querySelector<HTMLElement>('.di-counter');
    const curEl = section.querySelector<HTMLElement>('.di-counter-cur');
    const totalEl = section.querySelector<HTMLElement>('.di-counter-total');
    if (!counter || !curEl || !totalEl) return;

    let stops: Array<{ to: number; lead: string; note: string }> = [];
    try {
      stops = JSON.parse(counter.dataset['stops'] ?? '[]');
    } catch {
      stops = [];
    }
    if (!stops.length) return;

    const i = (swiper.realIndex ?? 0) + 1;
    const stop = stops.find((s) => i <= s.to) ?? stops[stops.length - 1];
    if (curEl.textContent !== stop.lead) {
      curEl.textContent = stop.lead;
      totalEl.textContent = stop.note;
    }
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

  /**
   * 格局產品（#spec）：47 / 52 坪兩款。
   * plan 目前為佔位圖（coming-soon.svg），實際格局圖丟進 assets/image/layout/ 後替換 plan 即可。
   */
  readonly layoutPlans: Array<{
    label: string;
    size: string;
    spec: string;
    desc: string;
    plan: string;
  }> = [
    {
      label: '精準的選擇',
      size: '47 坪',
      spec: '三房 · 兩衛 · 大陽台',
      desc: '精品自住首選——方正格局、雙衛皆開窗、光線直進不折。',
      plan: `${this.assetBase}/illustration/coming-soon.svg`,
    },
    {
      label: '多一點的餘裕',
      size: '52 坪',
      spec: '三房 · 雙主臥 · 寬景陽台',
      desc: '給自己更多餘裕——大主臥、寬景陽台、讓四季進得來的空間尺度。',
      plan: `${this.assetBase}/illustration/coming-soon.svg`,
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
  /** 統一管理所有 <video> 的進視窗播放／離開暫停 */
  private videoIo?: IntersectionObserver;

  private readonly document = inject(DOCUMENT);

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private host: ElementRef<HTMLElement>,
    private dialog: MatDialog
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // 以 faqs 陣列為「單一資料來源」：除了渲染可見 #faq 區塊，
    // 也在此動態產生 FAQPage JSON-LD 注入 <head>。在 SSR/prerender 階段執行，
    // 會被序列化進靜態 HTML，連不跑 JS 的爬蟲（GPTBot/ClaudeBot）都讀得到。
    this.injectFaqJsonLd();
  }

  /** 用 faqs 組出 schema.org FAQPage JSON-LD 並注入 <head>（以 id 防重複注入）。 */
  private injectFaqJsonLd(): void {
    const id = 'faq-jsonld';
    // prerender 後在 client 端會重跑 ngOnInit，已存在就略過，避免重複。
    if (this.document.getElementById(id)) return;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://www.fuhua-inno.com.tw/fhi-unveiling/#faq',
      mainEntity: this.faqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    };

    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    this.document.head.appendChild(script);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    setTimeout(() => this.onScroll(), 0);
    this.initAnimations();
    this.initVideoInViewPlayback();
  }

  ngOnDestroy(): void {
    this.videoIo?.disconnect();
    this.gsapCtx?.revert();
  }

  /**
   * 統一管理頁面上所有 <video>：進視窗才播、離開就暫停。
   *
   * 設計重點（之後替換素材不需改這裡）：
   * - 用單一 IntersectionObserver 掃描 host 內所有 <video>，與檔名/數量無關；
   *   日後換影片只是換 <video> 的 src，邏輯自動沿用。
   * - 在 JS 強制 muted + playsInline，確保瀏覽器允許無互動自動播放——
   *   就算未來素材的 markup 漏了屬性也不會壞。
   * - 搭配 template 的 preload="none"：首屏不下載任何影片，play() 時才抓。
   * - 尊重 prefers-reduced-motion：開啟時完全不自動播放，只留 poster。
   */
  private initVideoInViewPlayback(): void {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const videos = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLVideoElement>('video')
    );
    if (!videos.length) return;

    videos.forEach((v) => {
      v.muted = true;
      v.playsInline = true;
    });

    if (typeof IntersectionObserver === 'undefined') {
      videos.forEach((v) => v.play().catch(() => void 0));
      return;
    }

    this.videoIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => void 0);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );
    videos.forEach((v) => this.videoIo!.observe(v));
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
          '.hero .hero-scene',
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

      // ───── Hero layered parallax — 背景慢、前景建築快，疊出景深 ─────
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
      gsap.to('.hero .hero-buildings', {
        yPercent: -8,
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
          // scrub: 0.6,
        },
      });

      // ───── DISTRICT INTRO · 三段 Swiper 自動輪播（大圖高低錯落）─────
      // 改用 Swiper（autoplay + loop + slidesPerView:'auto'），不再用 GSAP pin；
      // 左下 di-counter is-phrase 由 onDistrictSlide() 隨 slide 切換文案。

      // ───── BUILDER-DEEP (甲級精工) — parallax bg + sticky 左文 + 卡片淡入 ─────
      const bdSection = root.querySelector<HTMLElement>('.builder-deep');
      if (bdSection) {
        const bdBg = bdSection.querySelector<HTMLElement>('.bd-bg');
        const bdLeft = bdSection.querySelector<HTMLElement>('.bd-essay-wrap');
        const bdStats = gsap.utils.toArray<HTMLElement>(
          '.builder-deep .bd-stat'
        );

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
          // Mobile: per-element fade-in; lede triggers at viewport 50%, stats after.
          bays.forEach((bay) => {
            const lede = bay.querySelector<HTMLElement>('.sb-lede');
            const stats = bay.querySelectorAll<HTMLElement>('.sb-stats li');
            if (lede)
              gsap.from(lede, {
                opacity: 0,
                y: 24,
                duration: 1,
                ease,
                scrollTrigger: {
                  trigger: lede,
                  start: 'top 50%',
                  toggleActions: 'play none none none',
                },
              });
            if (stats.length)
              gsap.from(stats, {
                opacity: 0,
                y: 20,
                stagger: 0.18,
                duration: 1.1,
                ease,
                scrollTrigger: {
                  trigger: bay,
                  start: 'top 60%',
                  toggleActions: 'play none none none',
                },
              });
          });
        } else {
          // ── Bays 1..n: park below viewport ──
          bays.forEach((bay, i) => {
            if (i > 0) gsap.set(bay, { yPercent: 100 });
          });

          // ── Bay 0: non-scrubbed reveal fires on onEnter ──
          const bay0 = bays[0];
          const b0Lede = bay0?.querySelector<HTMLElement>('.sb-lede');
          const b0Stats = bay0?.querySelectorAll<HTMLElement>('.sb-stats li');
          if (b0Lede) gsap.set(b0Lede, { opacity: 0, y: 20 });
          if (b0Stats?.length) gsap.set(b0Stats, { opacity: 0, y: 22 });

          const b0Tl = gsap.timeline({ paused: true });

          if (b0Lede)
            b0Tl.to(
              b0Lede,
              { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
              0.14
            );
          if (b0Stats?.length)
            b0Tl.to(
              b0Stats,
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.09,
                ease: 'power2.out',
              },
              0.28
            );

          // ── Bays 1+: hide text until their slide-in ──
          bays.forEach((bay, i) => {
            if (i === 0) return;
            const lede = bay.querySelector<HTMLElement>('.sb-lede');
            const stats = bay.querySelectorAll<HTMLElement>('.sb-stats li');
            if (lede) gsap.set(lede, { opacity: 0, y: 20 });
            if (stats.length) gsap.set(stats, { opacity: 0, y: 22 });
          });

          // ── Master pinned timeline ──
          // slot 0: bay 0 dwell  |  slot 1: bay 1 slides up  |  slot 2: bay 1 dwell
          // slot 3: bay 2 slides up  |  slot 4: bay 2 dwell  (5 slots for 3 bays)
          const slots = bays.length * 2 - 1;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: baysContainer,
              start: 'top top',
              end: () => `+=${window.innerHeight * slots}`,
              pin: true,
              pinSpacing: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onEnter: () => b0Tl.play(),
              onLeaveBack: () => b0Tl.reverse(),
            },
          });

          // Bay 0 dwell slot
          tl.to({}, { duration: 1 }, 0);

          bays.forEach((bay, i) => {
            if (i === 0) return;
            const lede = bay.querySelector<HTMLElement>('.sb-lede');
            const stats = bay.querySelectorAll<HTMLElement>('.sb-stats li');
            const slideStart = 2 * i - 1;

            // Slide bay up; power2.inOut gives a smooth symmetrical arc under scrub
            tl.to(
              bay,
              { yPercent: 0, duration: 1, ease: 'power2.inOut' },
              slideStart
            );

            // lede: appears at 50% of slide (panel entering viewport)
            // title: appears at 65% (image mostly in view)
            // stats: appear at 75%, longer stagger for dramatic ripple
            if (lede)
              tl.to(
                lede,
                { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' },
                slideStart + 0.5
              );
            if (stats.length)
              tl.to(
                stats,
                {
                  opacity: 1,
                  y: 0,
                  stagger: 0.15,
                  duration: 0.5,
                  ease: 'power2.out',
                },
                slideStart + 0.75
              );

            // Dwell slot
            tl.to({}, { duration: 1 }, 2 * i);
          });
        }
      }

      // ───── Section entry parallax — opacity scrub composes with CSS bg bridges ─────
      // 每個 section 進場時，主內容 opacity 由 0.25 漸入至 1，
      // 跟 SCSS 頂部 gradient bridge 一起作用，提供 parallax 切換感。
      // 只動 opacity 不動 transform，避免影響 .col-narrow 的 sticky 行為。
      const sectionEntries: Array<[string, string]> = [
        ['.spec', '.spec .head'],
        ['#design', '#design .catalog-inner'],
        ['#design-b', '#design-b .catalog-inner'],
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
        .toArray<HTMLElement>('.bd-img .ph-img, .group-img .ph-img')
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

      // ───── Catalog 設施區塊 — 文字 + swiper 進場淡入 ─────
      // 影片播放統一由 initVideoInViewPlayback() 的 IntersectionObserver 管理，
      // 這裡只負責文字與媒體欄進場淡入上滑。
      (['#design', '#design-b'] as string[]).forEach((sectionId) => {
        const items = gsap.utils.toArray<HTMLElement>(
          `${sectionId} .catalog-text > *, ${sectionId} .catalog-media`
        );
        if (!items.length) return;
        gsap.from(items, {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionId,
            start: 'top 80%',
            toggleActions: 'play none none none',
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

    const ids = ['hero', 'trust', 'spec', 'springs-bays', 'design', 'contact'];
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
    if (!el) return;
    // 用 getBoundingClientRect 而非 offsetTop：district-intro 被 GSAP pin 後會變成
    // position:fixed，offsetTop 不再代表它在文件中的實際高度，算出來的目標位置會錯。
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  trackByIndex(index: number): number {
    return index;
  }

  splitSpecValue(v: string): string[] {
    return v.split(' / ');
  }

  submit(): void {
    // 點送出才驗證：無效則標記全部欄位為 touched，觸發 mat-error / 同意提示
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.submitted = true;

    // 回報預約表單轉換給 GTM：在 GTM 後台用 'lead_submit' 事件當觸發條件，
    // 即可掛 GA4 轉換與 Meta Pixel 的 Lead，無需在程式內放任何 ID。
    // GTM 尚未載入（含 SSR）時 dataLayer 為 undefined，?. 會自動略過。
    if (this.isBrowser) {
      window.dataLayer?.push({
        event: 'lead_submit',
        form: 'booking',
        layout: this.layout,
        purpose: this.purpose,
      });
    }
  }

  /** 開啟「個人資料保護政策暨隱私權聲明」對話框 */
  openPrivacyPolicy(): void {
    this.dialog.open(PrivacyPolicyDialogComponent, {
      width: 'min(680px, 92vw)',
      maxHeight: '85vh',
      autoFocus: false,
      panelClass: 'pp-dialog-panel',
    });
  }
}
