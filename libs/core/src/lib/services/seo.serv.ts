import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Injector } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { AppEnv } from '../models/shared';
import { APP_ENV } from '../shared/helpers';

@Injectable({
  providedIn: 'root'
})
export class SEOServ {
  appEnv: AppEnv;

  get metaTitle(): string {
    return this.title.getTitle();
  }

  set metaTitle(content: string) {
    if (!content) {
      this.title.setTitle(this.appEnv.siteName);
      return;
    }

    this.title.setTitle(content);
  }

  constructor(
    private meta: Meta,
    private title: Title,
    protected injector: Injector,
    @Inject(DOCUMENT) private document: Document) {
      this.appEnv = injector.get(APP_ENV);
      // this.initMetaTags();
  }

  initMetaTags() {
    this.metaTitle = '';
    this.meta.addTags([
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'zh_TW' },
      { property: 'og:site_name', content: this.appEnv.siteName },
      { property: 'og:title', content: this.appEnv.siteName },
      { property: 'og:url', content: this.appEnv.siteServer },
      { property: 'og:image', content: `${this.appEnv.siteServer}/assets/image/og/chuhung-og.png` },
      { property: 'og:description', content: '傳承職人手藝的老菜脯滴雞精、陶甕窖藏熬製。' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: this.appEnv.siteName },
      { name: 'twitter:description', content: '傳承職人手藝的老菜脯滴雞精、陶甕窖藏熬製。' },
      { name: 'twitter:image', content: `${this.appEnv.siteServer}/assets/image/og/chuhung-og.png` },
      { name: 'keywords', content: '蘊和堂' },
      { name: 'description', content: '傳承職人手藝的老菜脯滴雞精、陶甕窖藏熬製。' }
    ]);
    this.setCanonical(this.appEnv.siteServer);
  }

  updateMetaTags(
    title = this.appEnv.siteName,
    url = this.appEnv.siteServer,
    image = `${this.appEnv.siteServer}/assets/image/og/chuhung-og.png`,
    description = '傳承職人手藝的老菜脯滴雞精、陶甕窖藏熬製。'
  ) {
    this.metaTitle = title;
    this.upsertMeta({ property: 'og:type' }, { property: 'og:type', content: 'website' });
    this.upsertMeta({ property: 'og:locale' }, { property: 'og:locale', content: 'zh_TW' });
    this.upsertMeta({ property: 'og:site_name' }, { property: 'og:site_name', content: this.appEnv.siteName });
    this.upsertMeta({ property: 'og:title' }, { property: 'og:title', content: title });
    this.upsertMeta({ property: 'og:url' }, { property: 'og:url', content: url });
    this.upsertMeta({ property: 'og:image' }, { property: 'og:image', content: image });
    this.upsertMeta({ property: 'og:description' }, { property: 'og:description', content: description });
    this.upsertMeta({ name: 'twitter:card' }, { name: 'twitter:card', content: 'summary_large_image' });
    this.upsertMeta({ name: 'twitter:title' }, { name: 'twitter:title', content: title });
    this.upsertMeta({ name: 'twitter:description' }, { name: 'twitter:description', content: description });
    this.upsertMeta({ name: 'twitter:image' }, { name: 'twitter:image', content: image });
    this.upsertMeta({ name: 'description' }, { name: 'description', content: description });
    this.setCanonical(url);
  }

  /**
   * 動態建立或更新 <link rel="canonical">，避免重複插入。SSR 安全（透過 DOCUMENT token）。
   */
  setCanonical(url: string) {
    if (!url) {
      return;
    }

    const head = this.document.head;
    if (!head) {
      return;
    }

    let link = head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private upsertMeta(
    selector: { name?: string; property?: string },
    tag: { name?: string; property?: string; content: string }
  ) {
    const attrSelector = selector.name
      ? `name="${selector.name}"`
      : `property="${selector.property}"`;
    const existed = this.meta.getTag(attrSelector);
    if (existed) {
      this.meta.updateTag(tag, attrSelector);
    } else {
      this.meta.addTag(tag);
    }
  }
}
