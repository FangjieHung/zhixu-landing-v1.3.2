/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, Injector, AfterViewInit, OnDestroy, inject } from '@angular/core';
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
export class DefaultComponent extends BBDBaseComponent implements OnInit {
  private _appMsgApiServ = inject(AppMsgApiServ);
  ads: BannerAdView[] = [];
  newsMsgs: AppNewsMsgView[] = [];

  constructor(
    private logoStateService: LogoStateService,
    protected override injector: Injector) {
    super(injector);
    if (this.isBrowser)
      gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit(): void {
    this.getCaches();
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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
