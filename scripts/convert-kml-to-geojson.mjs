// One-off / re-runnable conversion: docs/map/*.kml(.kmz) → apps/web/src/assets/data/*.geojson
// Re-run with `node scripts/convert-kml-to-geojson.mjs` whenever the client sends updated KML/KMZ.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { DOMParser } from '@xmldom/xmldom';
import * as tj from '@tmcw/togeojson';

// KML placemark descriptions are often scraped blog HTML (irrelevant external links) —
// drop everything except name + drawn style by default so popups stay clean and payload
// stays small. Pass extraKeep to retain source-specific fields (e.g. a real 'description').
const BASE_KEEP_PROPS = [
  'name',
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'icon-color', // 點狀交通站點/地標標記色，重劃區多邊形沒有這個欄位
];

function readKmlText(path) {
  if (path.endsWith('.kmz')) {
    // KMZ is just a zipped doc.kml — shell out to unzip rather than add a zip dependency.
    return execFileSync('unzip', ['-p', path, 'doc.kml'], { encoding: 'utf8' });
  }
  return readFileSync(path, 'utf8');
}

function loadFeatures(path, extraKeep = []) {
  // Some KML exports leave raw <br> (not self-closed, not CDATA-wrapped) in <description>,
  // which breaks strict XML parsing — self-close them before parsing.
  const raw = readKmlText(path).replace(/<br\s*>/gi, '<br/>');
  const xml = new DOMParser().parseFromString(raw, 'text/xml');
  const geojson = tj.kml(xml);
  const keep = [...BASE_KEEP_PROPS, ...extraKeep];
  for (const feature of geojson.features) {
    const trimmed = {};
    for (const key of keep) {
      if (key in feature.properties) trimmed[key] = feature.properties[key];
    }
    // KML sources vary wildly in fill-opacity per style (0.3 ~ 0.65+) — normalize so every
    // polygon layer reads with the same visual weight regardless of source.
    if ('fill-opacity' in trimmed) trimmed['fill-opacity'] = 0.3;
    feature.properties = trimmed;
  }
  return geojson.features;
}

function writeCollection(out, features) {
  writeFileSync(out, JSON.stringify({ type: 'FeatureCollection', features }));
  console.log(`-> ${out} (${features.length} features)`);
}

// 台中重劃區.kml 混合了兩種圖資：重劃區多邊形 + 交通站點(Point)，
// 拆成兩個獨立 geojson 檔，讓地圖圖層可以分開勾選顯示/隱藏。
{
  const kml = 'docs/map/台中重劃區.kml';
  const features = loadFeatures(kml);
  console.log(kml);
  writeCollection(
    'apps/web/src/assets/data/rezoning-districts.geojson',
    features.filter((f) => f.geometry.type !== 'Point'),
  );
  writeCollection(
    'apps/web/src/assets/data/transit-stops.geojson',
    features.filter((f) => f.geometry.type === 'Point'),
  );
}

{
  const kml = 'docs/map/大型公共設施用地.kml';
  console.log(kml);
  writeCollection(
    'apps/web/src/assets/data/public-facility-land.geojson',
    loadFeatures(kml),
  );
}

{
  const kmz = 'docs/map/商圈.kmz';
  console.log(kmz);
  writeCollection(
    'apps/web/src/assets/data/commercial-districts.geojson',
    loadFeatures(kmz),
  );
}

// 之序基地.kmz 裡有一個 Placemark 是基地本身的正確座標(名稱含「基地位置」)，
// 拿出來另外印出座標供手動更新 geo-map.component.ts 的 SITE_CENTER；
// 其餘 10 個是生活機能點位(含步行/開車時間 description)，轉成獨立圖層。
{
  const kmz = 'docs/map/之序基地.kmz';
  console.log(kmz);
  const features = loadFeatures(kmz, ['description']);
  const siteFeature = features.find((f) => f.properties.name?.includes('基地位置'));
  const amenities = features
    .filter((f) => f !== siteFeature)
    .map((f) => ({
      ...f,
      properties: { ...f.properties, 'icon-color': '#3a7d44' },
    }));
  writeCollection('apps/web/src/assets/data/amenities.geojson', amenities);
  if (siteFeature) {
    const [lng, lat] = siteFeature.geometry.coordinates;
    console.log(
      `SITE_CENTER (from "${siteFeature.properties.name}"): [${lat}, ${lng}] — update geo-map.component.ts manually`,
    );
  }
}
