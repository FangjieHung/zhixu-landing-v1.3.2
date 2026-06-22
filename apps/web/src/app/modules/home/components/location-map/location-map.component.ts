import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BBDBaseComponent } from '@core/shared';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Poi {
  x: number;
  y: number;
  min: number;
  name: string;
  reveal: number;
  anchor?: 'start' | 'end';
  /** label vertical position relative to marker; default above */
  vAnchor?: 'above' | 'below';
}

interface Route {
  id: string;
  /** sequential anchor points along the route; converted to smooth bezier via pointsToPath() */
  points: Array<{ x: number; y: number }>;
  stroke: string;
  width: number;
  label: string;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'middle' | 'end';
  reveal: number;
  duration: number;
}

/** Catmull-Rom-style smoothing：把折線控制點轉成平滑的三次貝茲曲線 d 字串 */
function pointsToPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  const tension = 0.5;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) * tension) / 3;
    const c1y = p1.y + ((p2.y - p0.y) * tension) / 3;
    const c2x = p2.x - ((p3.x - p1.x) * tension) / 3;
    const c2y = p2.y - ((p3.y - p1.y) * tension) / 3;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x} ${p2.y}`;
  }
  return d;
}

interface WalkRoute {
  id: string;
  /** 沿步行路線描的控制點（用 debug 浮層點出），轉成平滑曲線 */
  points: Array<{ x: number; y: number }>;
  /** phase-1 timeline 進場時機，通常對齊所連 POI 的 reveal */
  reveal: number;
}

interface EdgeMarker {
  /** 圓心 x（通常 = 0，圓心在 viewBox 左邊外側，視覺上只看到 1/4 ~ 1/2 圓） */
  x: number;
  y: number;
  /** 半圓半徑 */
  r: number;
  min: number;
  name: string;
  reveal: number;
}

// SVG viewBox 對齊底圖 (assets/image/map/map-bg.svg) 的 1831×1013
// SVG_CENTER = 之序在底圖上的實際 SVG 座標（使用者用 debug 浮層校正過）
const SVG_CENTER = { x: 895, y: 596 };

// transform-origin in CSS % — 鏡頭 zoom 以「之序」為中心
// 895 / 1831 ≈ 48.88 %, 596 / 1013 ≈ 58.83 %
const ZOOM_ORIGIN = '48.9% 58.8%';

// 鏡頭縮放關鍵節點
const ZOOM_PHASE1_START = 3.0;  // 緊鎖之序
const ZOOM_PHASE1_END = 1.2;    // 顯示 12 個近端 POI 涵蓋範圍（含洲際/中清/逢甲在上緣）
const ZOOM_PHASE2_END = 1.0;    // 顯示完整 viewBox（含左側 1/4 圓示意）

@Component({
  selector: 'app-location-map',
  templateUrl: './location-map.component.html',
  styleUrls: ['./location-map.component.scss'],
})
export class LocationMapComponent
  extends BBDBaseComponent
  implements AfterViewInit, OnDestroy
{
  @ViewChild('section', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('stage', { static: true }) stageRef!: ElementRef<HTMLElement>;
  @ViewChild('zoom', { static: true }) zoomRef!: ElementRef<HTMLElement>;
  @ViewChild('map', { static: true }) mapRef!: ElementRef<SVGSVGElement>;

  private gsapCtx?: gsap.Context;

  /** 之序在底圖上的 SVG viewBox 座標 — 中心 pin 的位置 */
  readonly centerPin = SVG_CENTER;

  /**
   * Phase 1 近端 POI — 座標由使用者用 debug 浮層在 map-bg.svg 上點過，直接寫死。
   * min 為非尖峰時段車程估算，待使用者用 Google Maps 路線確認。
   */
  readonly pois: Poi[] = [
    { x: 755,  y: 592, min: 5,  name: '中央公園 · 主入口', reveal: 0.22, anchor: 'end',   vAnchor: 'above' },
    { x: 776,  y: 363, min: 8,  name: '台中綠美圖',        reveal: 0.25, anchor: 'end',   vAnchor: 'above' },
    { x: 710,  y: 248, min: 10,  name: '水湳轉運中心',      reveal: 0.28, anchor: 'end',   vAnchor: 'above' },
    { x: 268,  y: 290, min: 10,  name: '台中國際會展中心',  reveal: 0.31, anchor: 'start', vAnchor: 'above' },
    { x: 598,  y: 835, min: 10,  name: '台中超巨蛋',        reveal: 0.34, anchor: 'end',   vAnchor: 'below' },
    { x: 853,  y: 770, min: 8,  name: '台中流行影音中心',  reveal: 0.37, anchor: 'start', vAnchor: 'below' },
    { x: 855,  y: 697, min: 6,  name: '水湳經貿園區站',    reveal: 0.40, anchor: 'start', vAnchor: 'above' },
    { x: 861,  y: 935, min: 25,  name: '捷運文華高中站',    reveal: 0.43, anchor: 'end',   vAnchor: 'below' },
    { x: 858,  y: 370, min: 15,  name: '迪卡儂',           reveal: 0.46, anchor: 'start', vAnchor: 'above' },
    { x: 1477, y: 188, min: 30, name: '臺中洲際棒球場',   reveal: 0.49, anchor: 'end',   vAnchor: 'above' },
    { x: 1024, y: 184, min: 15,  name: '中清商圈',         reveal: 0.52, anchor: 'end',   vAnchor: 'above' },
    { x: 554,  y: 189, min: 30,  name: '逢甲商圈',         reveal: 0.55, anchor: 'end',   vAnchor: 'above' },
  ];

  /**
   * Phase 1 步行路線 — 從之序到近端 POI 的步行動線。
   * points 用 debug 浮層沿路描點（之序 → POI），pointsToPath() 轉平滑曲線。
   * 樣式為金色虛線（footstep），reveal 對齊所連 POI。
   */
  readonly walkRoutes: WalkRoute[] = [
    // 範例：之序 → 中央公園主入口（待用 debug 浮層校正座標）
    // { id: 'walk-central-park', reveal: 0.22, points: [
    //   { x: 895, y: 596 },
    //   { x: 755, y: 592 },
    // ] },
  ];

  /**
   * Phase 2 邊界示意（中科、七期、工業區）— 完整圓，文字置中於圓內。
   * 圓心內移到 x≈95，避免被 viewBox 左邊界裁切。
   */
  readonly edgeMarkers: EdgeMarker[] = [
    { x: 95, y: 122, r: 90, min: 15, name: '中部科學園區', reveal: 0.77 },
    { x: 95, y: 952, r: 90, min: 10, name: '台中七期',     reveal: 0.81 },
    { x: 95, y: 651, r: 90, min: 15, name: '台中工業區',   reveal: 0.85 },
  ];

  /**
   * Phase 2 線路 — points 為使用者用 debug 浮層沿線描點而來，
   * pointsToPath() 把點轉成平滑貝茲曲線。
   */
  readonly routes: Route[] = [
    {
      id: 'freeway-1',
      stroke: '#3ad99c',
      width: 4,
      label: '國道 1 號',
      labelX: 575,
      labelY: 130,
      labelAnchor: 'middle',
      reveal: 0.62,
      duration: 0.04,
      points: [
        { x: 1,   y: 1008 },
        { x: 266, y: 701  },
        { x: 344, y: 495  },
        { x: 422, y: 364  },
        { x: 543, y: 229  },
        { x: 643, y: 142  },
        { x: 719, y: 97   },
        { x: 767, y: 74   },
      ],
    },
    {
      id: 'freeway-74',
      stroke: '#d94f3a',
      width: 4.5,
      label: '74 快速道路',
      labelX: 442,
      labelY: 554,
      labelAnchor: 'middle',
      reveal: 0.64,
      duration: 0.04,
      points: [
        { x: 212,  y: 1008 },
        { x: 279,  y: 798  },
        { x: 297,  y: 693  },
        { x: 335,  y: 584  },
        { x: 389,  y: 492  },
        { x: 449,  y: 399  },
        { x: 521,  y: 332  },
        { x: 619,  y: 280  },
        { x: 718,  y: 233  },
        { x: 835,  y: 184  },
        { x: 911,  y: 168  },
        { x: 1037, y: 169  },
        { x: 1157, y: 167  },
        { x: 1283, y: 168  },
        { x: 1395, y: 166  },
        { x: 1500, y: 168  },
        { x: 1939, y: 163  },
      ],
    },
    {
      id: 'mrt-orange',
      stroke: '#d97a3a',
      width: 3.6,
      label: '捷運橘線',
      labelX: 1032,
      labelY: 961,
      labelAnchor: 'middle',
      reveal: 0.66,
      duration: 0.04,
      points: [
        { x: 673, y: 77  },
        { x: 712, y: 153 },
        { x: 756, y: 239 },
        { x: 810, y: 334 },
        { x: 840, y: 421 },
        { x: 849, y: 510 },
        { x: 845, y: 591 },
        { x: 856, y: 687 },
        { x: 856, y: 717 },
        { x: 874, y: 799 },
        { x: 916, y: 898 },
        { x: 959, y: 990 },
      ],
    },
    {
      id: 'mrt-green',
      stroke: '#3dd93a',
      width: 3.6,
      label: '捷運綠線',
      labelX: 1430,
      labelY: 875,
      labelAnchor: 'end',
      reveal: 0.68,
      duration: 0.04,
      points: [
        { x: 747,  y: 1008 },
        { x: 803,  y: 964  },
        { x: 881,  y: 927  },
        { x: 965,  y: 900  },
        { x: 1037, y: 885  },
        { x: 1136, y: 864  },
        { x: 1186, y: 861  },
        { x: 1298, y: 883  },
        { x: 1409, y: 900  },
        { x: 1938, y: 989  },
      ],
    },
    {
      id: 'highway-1',
      stroke: '#d99c3a',
      width: 3.4,
      label: '台 1 線',
      labelX: 1209,
      labelY: 953,
      labelAnchor: 'middle',
      reveal: 0.70,
      duration: 0.04,
      points: [
        { x: 708,  y: 76   },
        { x: 782,  y: 217  },
        { x: 857,  y: 354  },
        { x: 925,  y: 476  },
        { x: 994,  y: 608  },
        { x: 1051, y: 715  },
        { x: 1114, y: 808  },
        { x: 1137, y: 835  },
        { x: 1157, y: 941  },
        { x: 1175, y: 1003 },
      ],
    },
    {
      id: 'thsr',
      stroke: '#d93a5f',
      width: 4,
      label: '台灣高鐵',
      labelX: 427,
      labelY: 116,
      labelAnchor: 'middle',
      reveal: 0.72,
      duration: 0.04,
      points: [
        { x: 369, y: 73   },
        { x: 361, y: 156  },
        { x: 346, y: 267  },
        { x: 316, y: 361  },
        { x: 285, y: 488  },
        { x: 253, y: 583  },
        { x: 204, y: 708  },
        { x: 161, y: 786  },
        { x: 101, y: 985  },
        { x: 98,  y: 1006 },
      ],
    },
  ];

  routeD(route: Route): string {
    return pointsToPath(route.points);
  }

  walkRouteD(route: WalkRoute): string {
    return pointsToPath(route.points);
  }

  walkRoutesTrack(_index: number, r: WalkRoute): string {
    return r.id;
  }

  /** TEMP: 路徑收集 debug 浮層，收集完所有座標後刪除 */
  debugHover = '移動滑鼠到地圖上 · 點擊累積座標 · 「清空」重置';
  debugPoints: Array<{ x: number; y: number }> = [];

  constructor(injector: Injector, private host: ElementRef<HTMLElement>) {
    super(injector);
  }

  onMapHover(event: MouseEvent): void {
    const local = this.svgPoint(event);
    if (!local) return;
    this.debugHover = `Hover · x=${Math.round(local.x)}  y=${Math.round(local.y)}`;
  }

  onMapClick(event: MouseEvent): void {
    const local = this.svgPoint(event);
    if (!local) return;
    const p = { x: Math.round(local.x), y: Math.round(local.y) };
    this.debugPoints = [...this.debugPoints, p];
    console.log(`[location-map] +P${this.debugPoints.length} = { x: ${p.x}, y: ${p.y} }`);
  }

  clearDebugPoints(): void {
    this.debugPoints = [];
    console.log('[location-map] debug points cleared');
  }

  /** 把 viewport mouse 座標轉成 SVG viewBox 座標 */
  private svgPoint(event: MouseEvent): { x: number; y: number } | null {
    const svg = this.mapRef.nativeElement;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    // Mobile：地圖橫向可滑、無動畫敘事，並把預設捲位捲到「之序」水平中心
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      this.centerOnZhixuMobile();
      return;
    }
    // 注意：此元件用 pinSpacing 的 ScrollTrigger pin（會插入約 3700px 的 pin-spacer），
    // 必須在載入時就建立，spacer 高度才會從一開始就在 layout 裡；若延後到捲動才 init，
    // pin-spacer 會在滑動中突然插入、把後面所有 section 的 trigger 位置擠錯位。
    this.initScrollAnimation();
  }

  /** mobile 初始時把橫向 scrollLeft 滑到讓「之序」位於可視中心 */
  private centerOnZhixuMobile(): void {
    // 等下一個 frame 確保 SVG 已經依 intrinsic 寬度算出實際尺寸
    requestAnimationFrame(() => {
      const stage = this.stageRef.nativeElement;
      const svg = this.mapRef.nativeElement;
      const mapWidth = svg.getBoundingClientRect().width;
      const stageWidth = stage.getBoundingClientRect().width;
      // 之序 在 viewBox 的水平比例 = 895 / 1831 ≈ 0.489
      const target = mapWidth * (SVG_CENTER.x / 1831) - stageWidth / 2;
      stage.scrollLeft = Math.max(0, target);
    });
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }

  private initScrollAnimation(): void {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.registerPlugin(ScrollTrigger);

    this.gsapCtx = gsap.context(() => {
      const section = this.sectionRef.nativeElement;
      const stage = this.stageRef.nativeElement;
      const svg = this.mapRef.nativeElement;
      // 縮放套在 GPU 合成層（HTML div），而非 svg 本身
      const zoom = this.zoomRef.nativeElement;

      // 預備：量測每條 route path 的長度，設定 dash 起始狀態
      const routePaths = Array.from(
        svg.querySelectorAll<SVGPathElement>('.lm-route-path'),
      );
      routePaths.forEach((path) => {
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
      });

      // 初始狀態 — 鏡頭緊鎖在之序、其他元素隱藏
      gsap.set(zoom, { scale: ZOOM_PHASE1_START, transformOrigin: ZOOM_ORIGIN });
      gsap.set('.lm-poi', { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
      gsap.set('.lm-walk-path', { opacity: 0 });
      gsap.set('.lm-edge-marker', { opacity: 0 });
      gsap.set('.lm-route-label', { opacity: 0 });
      gsap.set('.lm-caption-near', { opacity: 0, y: 24 });
      gsap.set('.lm-caption-far', { opacity: 0, y: 24 });
      gsap.set('.lm-pin .pin-pulse', { scale: 1, opacity: 0.55, transformOrigin: '50% 50%' });

      if (prefersReduced) {
        gsap.set(zoom, { scale: ZOOM_PHASE2_END, transformOrigin: ZOOM_ORIGIN });
        gsap.set('.lm-poi', { opacity: 0, scale: 1 });
        gsap.set('.lm-walk-path', { opacity: 0.85 });
        gsap.set('.lm-edge-marker', { opacity: 1 });
        gsap.set('.lm-route-label', { opacity: 1 });
        gsap.set('.lm-caption-far', { opacity: 1, y: 0 });
        routePaths.forEach((path) => { path.style.strokeDashoffset = '0'; });
        return;
      }

      // 主時間軸 — pin 住整個 stage、scrub 進度條
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=3700',
          scrub: 0.6,
          pin: stage,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ── Phase 1（0 ~ 0.59）─────────────────────────────────────
      tl.to(zoom, { scale: ZOOM_PHASE1_END, duration: 0.59 }, 0);

      this.pois.forEach((poi, i) => {
        tl.to(
          `.lm-poi[data-i="${i}"]`,
          { opacity: 1, scale: 1, duration: 0.04, ease: 'power2.out' },
          poi.reveal,
        );
      });

      // 步行路線 — 與所連 POI 同時淡入
      this.walkRoutes.forEach((w) => {
        tl.to(
          `.lm-walk-path[data-id="${w.id}"]`,
          { opacity: 0.85, duration: 0.05, ease: 'power2.out' },
          w.reveal,
        );
      });

      tl.to('.lm-caption-near', { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.56);

      // ── Phase 2（0.59 ~ 1.0）───────────────────────────────────
      // 近端 POI 與 caption 淡出
      tl.to('.lm-poi', { opacity: 0.9, duration: 0.05, ease: 'power1.in' }, 0.59);
      tl.to('.lm-caption-near', { opacity: 0.9, duration: 0.05, ease: 'power1.in' }, 0.59);

      // 鏡頭再拉遠
      tl.to(zoom, { scale: ZOOM_PHASE2_END, duration: 0.25 }, 0.60);

      // 線路 stroke draw-on
      this.routes.forEach((route) => {
        tl.to(
          `.lm-route-path[data-id="${route.id}"]`,
          { strokeDashoffset: 0, duration: route.duration, ease: 'power1.out' },
          route.reveal,
        );
        tl.to(
          `.lm-route-label[data-id="${route.id}"]`,
          { opacity: 0.92, duration: 0.04, ease: 'power2.out' },
          route.reveal + route.duration,
        );
      });

      // Edge markers (中科、七期) reveal
      this.edgeMarkers.forEach((m, i) => {
        tl.to(
          `.lm-edge-marker[data-i="${i}"]`,
          { opacity: 1, duration: 0.05, ease: 'power2.out' },
          m.reveal,
        );
      });

      // 遠景 caption 進場
      tl.to('.lm-caption-far', { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.89);

      // 中心 pin 持續呼吸（與 scroll 無關）
      gsap.fromTo(
        '.lm-pin .pin-pulse',
        { scale: 1, opacity: 0.55 },
        {
          scale: 2.2,
          opacity: 0,
          duration: 2.2,
          ease: 'power1.out',
          repeat: -1,
          repeatDelay: 0.2,
        },
      );

      setTimeout(() => ScrollTrigger.refresh(), 250);
    }, this.host.nativeElement);
  }

  /** label 水平偏移：anchor=end 在標記左側、start 在右側（r=8 圓，留小間距貼齊） */
  poiLabelX(poi: Poi): number {
    return poi.anchor === 'end' ? poi.x - 15 : poi.x + 15;
  }

  /**
   * label 垂直偏移：
   * - above：兩行文字（12 + 17）整體垂直置中於標記圓心
   * - below：整塊文字置於標記下方，貼齊 r=8 圓的下緣
   */
  poiLabelTopY(poi: Poi): number {
    return poi.vAnchor === 'below' ? poi.y + 22 : poi.y - 8;
  }
  poiLabelBottomY(poi: Poi): number {
    return poi.vAnchor === 'below' ? poi.y + 48 : poi.y + 14;
  }

  poisTrack(_index: number, p: Poi): number {
    return p.min * 1000 + p.x;
  }

  edgeMarkersTrack(_index: number, m: EdgeMarker): number {
    return m.y;
  }

  routesTrack(_index: number, r: Route): string {
    return r.id;
  }
}
