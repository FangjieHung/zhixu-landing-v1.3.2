import { Component, Injector } from "@angular/core";
import { BBDBaseComponent } from '@core/shared';

@Component({
  selector: "app-default",
  templateUrl: "./default.component.html",
  styleUrls: ["./default.component.scss"],
})
export class DefaultComponent extends BBDBaseComponent {

  constructor(injector: Injector) {
    super(injector);
  }
}
