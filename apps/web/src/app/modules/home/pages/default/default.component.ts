/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, Injector, ViewChild, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { forkJoin } from 'rxjs';

// Third party packages
import SwiperCore, { Autoplay, Navigation } from 'swiper';
import type { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
SwiperCore.use([Autoplay, Navigation]);

// Custom packages
import { BBDBaseComponent } from '@core/shared';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
})
export class DefaultComponent extends BBDBaseComponent implements OnInit {
  products = [
    {
      name: '尊享滋養體驗包',
      subtitle: '單包',
      desc: '為講究即時滋補者而設，一包即飲，呈現黑金萃取最純粹的濃郁與溫潤口感。',
      image: 'assets/image/product/product-01.jpg',
      price: 200,
      memberPrice: 180,
    },
    {
      name: '心意入門禮盒',
      subtitle: '8 入',
      desc: '獻給重要之人的貼心心意，份量精緻不張揚，是初次送禮或日常關懷的理想選擇。',
      image: 'assets/image/product/product-00.jpg',
      price: 1600,
      memberPrice: 1280,
    },
    {
      name: '日常尊養禮盒',
      subtitle: '12 入',
      desc: '專為細水長流的滋養所設，體面份量，適合送給長輩或重視日常調養的對象。',
      image: 'assets/image/product/product-00.jpg',
      price: 2400,
      memberPrice: 1920,
    },
    {
      name: '深度滋補雅藏禮盒',
      subtitle: '30 入',
      desc: '為重視長期調養者準備的誠意之選，適合重要節慶、家族贈禮或企業團贈。',
      image: 'assets/image/product/product-08.jpg',
      price: 6000,
      memberPrice: 4500,
    },
    {
      name: '極致尊榮典藏禮盒',
      subtitle: '60 入',
      desc: '品牌最高規格禮盒，象徵最深厚的心意與關懷，適合頂級送禮、企業貴賓與長期滋養。',
      image: 'assets/image/product/product-09.webp',
      price: 12000,
      memberPrice: 9000,
    },
  ];

  certifications = [
    {
      name: 'ISO 22000',
      label: '食品安全管理國際認證',
      image: 'assets/image/certificate/certificate-iso22000-blur.webp',
      alt: 'ISO 22000 食品安全管理國際認證',
    },
    {
      name: 'HACCP',
      label: '危害分析重要管制點認證',
      image: 'assets/image/certificate/certificate-haccp-blur.webp',
      alt: 'HACCP 危害分析重要管制點認證',
    },
    {
      name: 'SGS',
      label: '國際第三方檢驗認證',
      image: 'assets/image/certificate/certificate-sgs-blur.webp',
      alt: 'SGS 國際檢驗認證',
    },
    {
      name: 'SGS',
      label: '橘黴素未檢出',
      image: 'assets/image/certificate/certificate-sgs-citrinin.webp',
      alt: 'SGS 橘黴素未檢出',
    },
  ];

  private _partnerLogosBase = [
    { src: 'assets/image/partner/春生LOGO-03.png', alt: '春生' },
    { src: 'assets/image/partner/alic-logo.png', alt: 'alic' },
    { src: 'assets/image/partner/city-parking.png', alt: 'city-parking' },
    // { src: 'assets/image/partner/環景logo.png', alt: '環景' },
  ];
  
  partnerLogos = [...this._partnerLogosBase, ...this._partnerLogosBase];

  certSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    navigation: true,
    breakpoints: {
      640: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
      1440: {
        slidesPerView: 5,
      },
    },
  };

  // 母公司照片
  parentSlides: { src: string; alt: string }[] = [
    { src: 'assets/image/office/S__89260117_0.webp', alt: 'Company Office 1' },
    { src: 'assets/image/office/S__89260118_0.webp', alt: 'Company Office 2' },
    { src: 'assets/image/office/S__89260119_0.webp', alt: 'Company Office 3' },
    { src: 'assets/image/office/S__89260120_0.webp', alt: 'Company Office 4' },
    { src: 'assets/image/office/S__89260121_0.webp', alt: 'Company Office 5' },
    { src: 'assets/image/office/S__89260122_0.webp', alt: 'Company Office 6' },
  ];

  parentCarouselConfig: SwiperOptions = {
    slidesPerView: 1,
    loop: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    pagination: { clickable: true },
  };

  formatPrice = (v: number) => new Intl.NumberFormat('en-US').format(v);

  constructor(
    protected override injector: Injector) {
    super(injector);
    if (this.isBrowser)
      gsap.registerPlugin(ScrollTrigger);
  }

  @ViewChild('parentCarousel') parentCarousel?: SwiperComponent;

  ngOnInit(): void {
    console.log();
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  // getCaches(): void { }
}
