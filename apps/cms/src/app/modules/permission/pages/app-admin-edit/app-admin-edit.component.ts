import { Component, inject, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

// Antd packages
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

// Custom packages
import { BBDBaseComponent, Validation } from '@core/shared';
import { AppAdminDto, AppUserStatuses } from '@core/models';
import { AppUserApiServ } from '@core/services';

@Component({
  selector: 'cms-app-admin-edit',
  templateUrl: './app-admin-edit.component.html',
  styleUrls: ['./app-admin-edit.component.scss'],
})
export class AppAdminEditComponent extends BBDBaseComponent implements OnInit {
  readonly modalData: { id: number } = inject(NZ_MODAL_DATA);
  _id = 0;
  valForm!: UntypedFormGroup;
  editDto = new AppAdminDto();

  passwordHide = true;

  // IOs & Gets & Sets
  get f(): { [key: string]: AbstractControl } {
    return this.valForm.controls;
  }
  constructor(
    public appUserApiServ: AppUserApiServ,
    private modal: NzModalRef,
    private fb: FormBuilder,
    protected override injector: Injector,) {
    super(injector);
    this.doFormInit();
  }

  ngOnInit(): void {
    this.doDataInit();
  }

  // getCaches(): void { }

  doFormInit(): void {
    this.valForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(20)]],
      nameEn: [null, [Validators.maxLength(50)]],
      mobile: [null, [Validators.maxLength(12)]],
      email: [null, [Validators.email, Validators.maxLength(100)]],
      account: [null, [Validators.required, Validators.maxLength(100)]],
      appUserStartAt: [null, [Validators.required]],
      appUserEndAt: [null],
      appUserStatus: [null, [Validators.required]],
      password: ['', [Validators.maxLength(64)]],
      confirmPassword: [''],
    }, {
      validators: [
        Validation.match('password', 'confirmPassword')
      ]
    });
  }

  doDataInit() {
    this._id = this.modalData?.id || 0;
    // add
    if (!this._id) {
      this.editDto = new AppAdminDto();
      this.editDto.appUserStartAt = new Date();
      this.editDto.appUserStatus = AppUserStatuses.啟用;
      this.doFormPatchValue();
      return;
    }
    // update
    this.appUserApiServ.getAppAdminDtoById(this._id).subscribe({
      next: (res) => {
        if (!res) {
          this.bbdNotifyServ.error('無法取得資料。');
          this.doCancel();
          return;
        }

        this.editDto = res;
        this.doDateParse(true);
        this.doFormPatchValue();
      },
      error: (err) => {
        this.bbdNotifyServ.error('執行失敗', err);
        this.doCancel();
      },
    });
  }

  doFormPatchValue(): void {
    if (!this.editDto) {
      return;
    }
    this.valForm.patchValue(this.editDto);
  }

  doCancel(): void {
    this.modal.destroy();
  }

  onSubmit(): void {
    this.canSubmit();
    this.spinnerServ.show();
    this.appUserApiServ.setAppAdminDto(this.editDto).subscribe({
      next: (res) => {
        if (!res) {
          this.bbdNotifyServ.error(`新增失敗，請再重試一次。`);
          return;
        }
        this.bbdNotifyServ.success(this._id ? `修改成功。` : `新增成功。`);
        this.modal.destroy(true);
      },
      error: (err) => {
        this.bbdNotifyServ.error('執行失敗', err);
      },
    }).add(() => this.spinnerServ.hide());
  }

  canSubmit() {
    this.valForm.markAllAsTouched();
    if (this.valForm.valid === false) {
      Object.values(this.valForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.bbdNotifyServ.error('送出失敗，請確認是否有欄位尚未填寫。');
      throw new Error("送出失敗");
    }
    if (!this.editDto) {
      this.bbdNotifyServ.error('送出失敗，請確認是否有欄位尚未填寫。');
      throw new Error("送出失敗");
    }

    Object.assign(this.editDto, this.valForm.value);
    if (this.editDto.appUserEndAt)
      this.editDto.appUserEndAt = this.editDto.appUserEndAt.getEndOfDay();
    this.doDateParse();
  }

  doDateParse(isInit = false): void {
    if (isInit) {
      this.editDto.appUserEndAt = this.dateHelper.parseAppMaxUtcDateToNull(this.editDto.appUserEndAt);
    } else {
      this.editDto.appUserEndAt = this.dateHelper.parseNullToAppMaxUtcDate(this.editDto.appUserEndAt);
    }
  }

}
