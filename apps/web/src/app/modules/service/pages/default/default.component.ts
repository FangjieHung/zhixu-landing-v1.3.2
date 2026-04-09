import { Component, Injector, OnInit } from '@angular/core';
import { BBDBaseComponent } from '@core/shared';

@Component({
  selector: 'web-service-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent extends BBDBaseComponent implements OnInit {

  constructor(protected override injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}
}
