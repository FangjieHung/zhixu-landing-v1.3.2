import { Component, EventEmitter, Injector, Input, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppAttachApiServ } from '@core/services';
import { BBDBaseComponent } from '@core/shared';

@Component({
  selector: 'cms-img-preview',
  templateUrl: './cms-img-preview.component.html',
  styleUrls: ['./cms-img-preview.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CmsImgPreviewComponent),
      multi: true
    }
  ]
})
export class CmsImgPreviewComponent extends BBDBaseComponent implements OnInit, ControlValueAccessor {
  _attId = 0;
  // IOs
  @Input() isShowDelAtt = false;
  @Output() doAttDel = new EventEmitter();
  
  get attId(): number {
    return this._attId;
  }

  set attId(value: number) {
    this._attId = value;
    this.propagateChange(this._attId);
  }

  constructor(
    private appAttachApiServ: AppAttachApiServ,
    protected override injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    console.log();
  }

  writeValue(value: number) {
    if (value !== undefined) {
      this.attId = value;
    }
  }

  propagateChange = (_: any) => {
    console.log();
  };
  propagateTouched = (_: any) => {
    console.log();
  };

  registerOnChange(fn: (_: any) => void) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: any) => void) {
    this.propagateTouched = fn;
  }

  onDelAppFileAtt(): void {
    this.doAttDel.emit(this._attId);

    // 暫時不採用直接刪除，避免忘記存擋時圖片無法顯示
    // this.appAttachApiServ.delAppFileAtt(this._attId).subscribe({
    //   next: (res) => {
    //     if (!res) {
    //       this.messageServ.error('圖片刪除失敗，請再重試一次。');
    //       return;
    //     }

    //     this.messageServ.success('圖片刪除失敗成功。');
    //     this.doAttDel.emit(this._attId);
    //     this.attId = 0;
    //   },
    //   error: (err) => {
    //     this.notificationServ.error(
    //       '執行失敗',
    //       `錯誤訊息：「${err?.error?.errorMessage}」`
    //     );
    //   },
    // }).add(() => this.spinnerServ.hide());
  }
}
