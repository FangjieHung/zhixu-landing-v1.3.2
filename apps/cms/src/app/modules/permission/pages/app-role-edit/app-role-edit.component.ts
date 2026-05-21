import { Component, inject, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

// Antd packages
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

// Custom packages
import { BBDBaseComponent } from '@core/shared';
import { AppRoleDto, AppRoleRouteDto, AppRouteView } from '@core/models';
import { AppRoleApiServ, SharedDataServ } from '@core/services';

@Component({
  selector: 'cms-app-role',
  templateUrl: './app-role-edit.component.html',
  styleUrls: ['./app-role-edit.component.scss'],
})
export class AppRoleEditComponent extends BBDBaseComponent implements OnInit {
  readonly modalData: { id: number, actionName?: string } = inject(NZ_MODAL_DATA);
  private _id = 0;
  profileDto = new AppRoleDto();
  valForm!: UntypedFormGroup;
  listRouteChecked: AppRouteChecked[] = [];
  selectedParentId = 0;

  // IOs & Gets & Sets
  get f(): { [key: string]: AbstractControl } {
    return this.valForm.controls;
  }
  constructor(
    public appRoleApiServ: AppRoleApiServ,
    public sharedDataServ: SharedDataServ,
    private modal: NzModalRef,
    private fb: FormBuilder,
    protected override injector: Injector,) {
    super(injector);
    this.getCaches();
    this.doFormInit();
  }

  ngOnInit(): void {
    this.doDataInit();
  }

  getCaches(): void {
    this.storeServ.getAppRoutesCache().subscribe({
      next: (res) => {
        if (!res) {
          this.bbdNotifyServ.error('無法取得功能資料。');
          this.doCancel();
          return;
        }
        this.listRouteChecked = res;
        this.listRouteChecked.map(item => {
          item.checkedCount = 0;
          item.checked = false;
        });
      },
      error: (err) => {
        this.bbdNotifyServ.error('執行失敗', err);
        this.doCancel();
      }
    });
  }

  doFormInit(): void {
    this.valForm = this.fb.group({
      appPfm: [null, [Validators.required]],
      name: [null, [Validators.required, Validators.maxLength(15)]],
      status: [null, [Validators.required]],
    });
  }

  doDataInit() {
    this._id = this.modalData?.id || 0;
    this.selectedParentId = 0;

    // add
    if (!this._id) {
      this.profileDto = new AppRoleDto();
      this.doFormPatchValue();
      return;
    }

    // update
    this.appRoleApiServ.getAppRoleDtoById(this._id).subscribe({
      next: (res) => {
        if (!res) {
          this.bbdNotifyServ.error('無法取得資料。');
          this.doCancel();
          return;
        }

        this.profileDto = res;
        this.doFormPatchValue();

        this.profileDto?.roleRouteDtos?.map(dto => {
          const route = this.listRouteChecked.find(item => item.id === dto.appRouteId);

          if (route) {
            route.checked = true;
          }
        });
        this.doCalcRouteCheckedCount();
      },
      error: (err) => {
        this.bbdNotifyServ.error('執行失敗', err);
        this.doCancel();
      }
    });
  }

  doFormPatchValue(): void {
    if (!this.profileDto) {
      return;
    }

    this.valForm.patchValue(this.profileDto);
  }

  doCancel(): void {
    this.modal.destroy();
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

      this.bbdNotifyServ.error('存檔失敗，請確認是否有欄位尚未填寫。');
      throw new Error("存檔失敗");
    }

    Object.assign(this.profileDto, this.valForm.value);
  }

  doCalcRouteCheckedCount(): void {
    if (this.listRouteChecked.isUndefinedOrNullOrEmpty()) {
      return;
    }

    const parents = this.listRouteChecked.filter(item =>
      item.appPfm === this.profileDto.appPfm &&
      item.parentId === 0);

    if (parents.isUndefinedOrNullOrEmpty()) {
      return;
    }

    parents.map(parent => {
      parent.checkedCount = this.listRouteChecked.filter(item => item.parentId === parent.id && item.checked).length;
    });
  }

  onToggleChange(child: AppRouteChecked, checked: boolean): void {
    if (!child) {
      return;
    }

    if (!this.profileDto.roleRouteDtos) {
      this.profileDto.roleRouteDtos = [];
    }

    const roleRoute = this.profileDto.roleRouteDtos.find(item => item.appRouteId === child.id);

    if (checked) {
      if (roleRoute) {
        roleRoute.delAt = new Date().getAppMaxUtcDate();
      }
      else {
        const obj = new AppRoleRouteDto();
        obj.appRoleId = this.profileDto.id;
        obj.appRouteId = child.id;

        this.profileDto.roleRouteDtos.push(obj);
      }
    } else {
      if (roleRoute) {
        if (roleRoute.id > 0) {
          roleRoute.delAt = new Date();
        } else {
          this.profileDto.roleRouteDtos = this.profileDto.roleRouteDtos.filter(item => item.appRouteId !== child.id);
        }
      }
    }

    const parent = this.listRouteChecked.find(item => item.id === child.parentId);

    if (!parent) {
      return;
    }

    parent.checkedCount = this.listRouteChecked.filter(item => item.parentId === parent.id && item.checked).length;

    const parentRoleRoute = this.profileDto.roleRouteDtos.find(item => item.appRouteId === parent.id);
    if (parent.checkedCount > 0) {
      if (!parentRoleRoute) {
        const obj = new AppRoleRouteDto();
        obj.appRoleId = this.profileDto.id;
        obj.appRouteId = parent.id;

        this.profileDto.roleRouteDtos.push(obj);
      } else {
        parentRoleRoute.delAt = new Date().getAppMaxUtcDate();
      }
    } else {
      if (parentRoleRoute) {
        if (parentRoleRoute.id > 0) {
          parentRoleRoute.delAt = new Date();
        } else {
          this.profileDto.roleRouteDtos = this.profileDto.roleRouteDtos.filter(item => item.appRouteId !== parent.id);
        }
      }
    }
  }

  onSubmit(): void {
    this.canSubmit();
    this.spinnerServ.show();
    this.appRoleApiServ.setAppRoleDto(this.profileDto)
      .subscribe({
        next: (res) => {
          if (!res) {
            this.bbdNotifyServ.error('新增訂單失敗，請再重試一次。');
            return;
          }
          this.storeServ.resetAppRolesCache();
          this.bbdNotifyServ.success(this._id ? '變更角色成功。' : '新增角色成功。');
          this.modal.destroy(true);
        },
        error: (err) => {
          this.bbdNotifyServ.error('執行失敗', err);
        },
      }).add(() => this.spinnerServ.hide());
  }
}


interface AppRouteChecked extends AppRouteView {
  checkedCount?: number;
  checked?: boolean;
}
