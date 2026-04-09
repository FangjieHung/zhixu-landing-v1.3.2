/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Injector, inject, ViewChild, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LogoStateService } from '../../../../shared/services/logo-state.service';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

// Custom packages
import { BBDBaseComponent } from '@core/shared';
import { AppObjectStoreCodes, OrgContactJto } from '@core/models';
import { AppStoreApiServ, SEOServ } from '@core/services';

@Component({
  selector: 'web-default-container',
  templateUrl: './default-container.component.html',
  styleUrls: ['./default-container.component.scss']
})

export class DefaultContainerComponent extends BBDBaseComponent implements OnInit {
  isLogoLarge$!: Observable<boolean>;
  currentUrl = '';
  activeMenu: string | null = null;
  isMenuOpen = false;

  @ViewChild('snav') snav!: MatSidenav;

  private _appStoreApiServ = inject(AppStoreApiServ);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _seoServ = inject(SEOServ);

  response: OrgContactJto | null = null;

  navList = [
    {
      label: '老菜脯滴雞精',
      link: '/product'
    },
    {
      label: '清潔服務',
      link: '/service'
    }
  ];

  accountMenu = [
    // { label: '我的課程', link: '/' },
    { label: '個人資料', link: '/account/profile' },
    { label: '重設密碼', link: '/account/password' }
  ];

  constructor(
    private logoStateService: LogoStateService,
    protected override injector: Injector) {
    super(injector);
    this.isLogoLarge$ = this.logoStateService.isLargeLogo$;
  }

  ngOnInit(): void {
    this.doDataInit();
    if (this.appAuthApiServ.hasAccessToken) {
      this.storeServ.getCurrAuthUserCache();
    }
    
    this._seoServ.updateMetaTags();
    this._router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const currRoute = this.getDeepestChildRoute(this._route);
        const seoData = currRoute.snapshot.data;
        if (seoData) {
          this._seoServ.updateMetaTags(seoData['title'], seoData['url'], seoData['image'], seoData['description']);
        } else {
          this._seoServ.updateMetaTags();
        }
      });

  }

  getDeepestChildRoute(route: ActivatedRoute): ActivatedRoute {
    let r = route;
    while (r.firstChild) {
      r = r.firstChild;
    }
    return r;
  }

  doDataInit(): void {
    this._appStoreApiServ.getAppObjectStoreValueByCode(AppObjectStoreCodes.學會聯絡方式設定檔).subscribe({
      next: (res) => {
        if (!res) {
          return;
        }

        this.response = res;
      },
      error: (err) => {
        this.bbdNotifyServ.error('執行失敗', err);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideMenu = target.closest('.menu-wrap');
    if (!clickedInsideMenu) {
      this.activeMenu = null;
    }
  }

  toggleSideMenu() {
    this.snav.toggle();
  }

  toggleNavbarMenu(label: string) {
    this.activeMenu = this.activeMenu === label ? null : label;
  }

  closeNavbarMenu() {
    this.activeMenu = null;
  }

  toggleSingleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
