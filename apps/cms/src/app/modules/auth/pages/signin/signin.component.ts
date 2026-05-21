import { Component, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Custom packages
import { BBDBaseComponent } from '@core/shared';
import { SigninReq } from '@core/models';

@Component({
  selector: 'cms-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})

export class SigninComponent extends BBDBaseComponent implements OnInit {
  // Properties
  passwordHide = true;
  signinReq: SigninReq = new SigninReq();
  validateForm!: UntypedFormGroup;
  timeSlot: 'day' | 'night' = 'day';

  // IOs & Gets & Sets
  get f(): { [key: string]: AbstractControl } {
    return this.validateForm.controls;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected override injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.doFormInit();
    this.doTimeSlotInit();
  }

  doFormInit() {
    this.validateForm = this.fb.group({
      account: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  doTimeSlotInit(): void {
    const hours = new Date().getHours();

    if (hours >= 0 && hours <= 4) {
      this.timeSlot = 'night';
    } else if (hours >= 5 && hours <= 18) {
      this.timeSlot = 'day';
    } else if (hours >= 19 && hours <= 23) {
      this.timeSlot = 'night';
    }
  }

  canSubmit(): boolean {
    if (this.validateForm.valid === false) {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return false;
    }

    Object.assign(this.signinReq, this.validateForm.value);

    return true;
  }

  onSubmit() {
    if (this.canSubmit() === false) {
      return;
    }

    this.spinnerServ.show();
    this.appAuthApiServ.signin(this.signinReq)
      .subscribe({
        next: (res) => {
          if (!res) {
            this.notificationServ.error('登入失敗', '請確認帳號及密碼是否有效。');
            return;
          }
          this.storeServ.getCurrAuthUserCache();
          this.router.navigate(['/']);
          this.messageServ.success('登入成功。');
        },
        error: (err) => {
          this.appAuthApiServ.signout();
          this.notificationServ.error('登入失敗', err?.message);
        }
      }).add(() => this.spinnerServ.hide());
  }
}
