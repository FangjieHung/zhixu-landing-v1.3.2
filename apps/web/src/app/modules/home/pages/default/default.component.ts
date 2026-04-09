/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, Injector, AfterViewInit, HostListener, OnDestroy, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { forkJoin } from 'rxjs';
import { LogoStateService } from '../../../../shared/services/logo-state.service';

// Third party packages
import SwiperCore, { Autoplay, Navigation } from 'swiper';
SwiperCore.use([Autoplay, Navigation]);

// Custom packages
import { BBDBaseComponent } from '@core/shared';
import {
  AppNewsMsgView, BannerAdView
} from '@core/models';
import { AppMsgApiServ } from '@core/services';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
})
export class DefaultComponent extends BBDBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  private _appMsgApiServ = inject(AppMsgApiServ);
  ads: BannerAdView[] = [];
  newsMsgs: AppNewsMsgView[] = [];

  bannerSwipe = {
    slidesPerView: 1,
    spaceBetween: 32,
    navigation: {
      nextEl: '.swiper-btn-banner.next',
      prevEl: '.swiper-btn-banner.prev',
    },
  };

  constructor(
    private logoStateService: LogoStateService,
    protected override injector: Injector) {
    super(injector);
    if (this.isBrowser)
      gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit(): void {
    this.updateLogoScale();
    this.getCaches();
  }

  ngAfterViewInit(): void {
    this.updateLogoScale();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.updateLogoScale();
  }

  private updateLogoScale(): void {
    if (!this.isBrowser)
      return;

    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const threshold = window.innerHeight * 0.2; // 20vh

    const isLarge = scrollY <= threshold;
    this.logoStateService.setLogoScale(isLarge);
  }

  ngOnDestroy(): void {
    // 離開 Home 頁面時，將 Logo 狀態重置
    this.logoStateService.setLogoScale(false);
  }

  getCaches(): void {
    this.spinnerServ.show();
    forkJoin([
      this._appMsgApiServ.getAppNewsMsgViews(),
      this._appMsgApiServ.getBannerAdViews()
    ]).subscribe(([news, ads]) => {
      this.newsMsgs = news;
      this.ads = ads;
    }).add(() => this.spinnerServ.hide());
  }
}
