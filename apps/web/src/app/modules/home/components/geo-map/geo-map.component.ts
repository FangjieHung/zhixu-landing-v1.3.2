import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BBDBaseComponent } from '@core/shared';
// Type-only import: erased at compile time, so it never pulls in Leaflet's runtime module.
// Leaflet's runtime touches `window`/`navigator` at import time, which crashes Angular Universal
// prerendering (Node has no window) — the actual module is loaded via dynamic import() below,
// gated behind isBrowser, so it never executes during SSR.
import type * as L from 'leaflet';

/** 之序基地座標 — 來自 docs/map/之序基地.kmz 的「富華創新【之序】基地位置」Placemark，非地理編碼估計值 */
const SITE_CENTER: [number, number] = [24.1844909, 120.6597422];

interface LayerConfig {
  key: 'rezoning' | 'transit' | 'facility' | 'amenities' | 'commercial';
  label: string;
  url: string;
  visible: boolean;
  layer?: L.GeoJSON;
}

@Component({
  selector: 'app-geo-map',
  templateUrl: './geo-map.component.html',
  styleUrls: ['./geo-map.component.scss'],
})
export class GeoMapComponent
  extends BBDBaseComponent
  implements AfterViewInit, OnDestroy
{
  @ViewChild('mapEl', { static: true }) mapElRef!: ElementRef<HTMLDivElement>;

  private map?: L.Map;

  readonly layers: LayerConfig[] = [
    {
      key: 'amenities',
      label: '地標建設',
      url: 'assets/data/amenities.geojson',
      visible: true,
    },
    {
      key: 'transit',
      label: '交通樞紐',
      url: 'assets/data/transit-stops.geojson',
      visible: true,
    },
    {
      key: 'commercial',
      label: '商圈',
      url: 'assets/data/commercial-districts.geojson',
      visible: true,
    },
    {
      key: 'rezoning',
      label: '重劃區',
      url: 'assets/data/rezoning-districts.geojson',
      visible: true,
    },
  ];

  constructor(injector: Injector) {
    super(injector);
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;
    const L = await import('leaflet');
    this.initMap(L);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  toggleLayer(config: LayerConfig): void {
    config.visible = !config.visible;
    if (!this.map || !config.layer) return;
    if (config.visible) {
      config.layer.addTo(this.map);
    } else {
      this.map.removeLayer(config.layer);
    }
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }

  private initMap(L: typeof import('leaflet')): void {
    const map = L.map(this.mapElRef.nativeElement, {
      center: SITE_CENTER,
      zoom: 15,
      minZoom: 11, // 拉遠的下限,太小會看不到重點只剩一片
      maxZoom: 20, // 拉近的上限,跟 tileLayer 的 maxZoom 對齊
      zoomControl: false, // 關掉原生 +/- 按鈕,改用圖層面板裡的自訂按鈕
      scrollWheelZoom: false,
    });
    this.map = map;

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      },
    ).addTo(map);

    const siteIcon = L.divIcon({
      className: 'gm-site-marker',
      html: '<span class="gm-site-marker__ring"></span><span class="gm-site-marker__dot"></span>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker(SITE_CENTER, { icon: siteIcon })
      .addTo(map)
      .bindTooltip('富華創新【之序】基地位置', {
        permanent: true,
        direction: 'top',
        offset: [0, -14],
        className: 'gm-site-label',
      });

    this.layers.forEach((config) => this.loadLayer(L, config));
  }

  private async loadLayer(
    L: typeof import('leaflet'),
    config: LayerConfig,
  ): Promise<void> {
    const data: GeoJSON.FeatureCollection = await fetch(config.url).then(
      (res) => res.json(),
    );
    const layer = L.geoJSON(data, {
      style: (feature) => ({
        color: feature?.properties?.stroke ?? '#8c142d',
        weight: feature?.properties?.['stroke-width'] ?? 1.2,
        opacity: feature?.properties?.['stroke-opacity'] ?? 1,
        fillColor: feature?.properties?.fill ?? '#8c142d',
        fillOpacity: feature?.properties?.['fill-opacity'] ?? 0.3,
      }),
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 5,
          color: '#ffffff',
          weight: 1.5,
          fillColor: feature?.properties?.['icon-color'] ?? '#8c142d',
          fillOpacity: 1,
        }),
      onEachFeature: (feature, l) => {
        const name = feature?.properties?.name;
        if (!name) return;
        const isPoint = feature.geometry.type === 'Point';
        const desc = feature?.properties?.description;
        const label = desc ? `${name} · ${desc}` : name;
        l.bindTooltip(label, {
          permanent: true,
          direction: isPoint ? 'right' : 'center',
          offset: isPoint ? [8, 0] : [0, 0],
          className: isPoint ? 'gm-point-label' : 'gm-district-label',
        });
      },
    });
    config.layer = layer;
    if (config.visible && this.map) layer.addTo(this.map);
  }
}
