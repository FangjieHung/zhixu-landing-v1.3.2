import { Component, EventEmitter, Injector, Input, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppAttachApiServ } from '@core/services';
import { BBDBaseComponent } from '@core/shared';

@Component({
  selector: 'cms-quill-editor',
  templateUrl: './cms-quill-editor.component.html',
  styleUrls: ['./cms-quill-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CmsQuillEditorComponent),
      multi: true
    }
  ]
})
export class CmsQuillEditorComponent extends BBDBaseComponent implements OnInit, ControlValueAccessor {
  formData = new FormData();

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;

  // IOs
  @Input() _content = '';
  @Output() _contentChange = new EventEmitter<string>();
  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
    this.propagateChange(this._content);
    this._contentChange.emit(this._content);
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

  writeValue(value: string) {
    if (value !== undefined) {
      this._content = value;
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

  editorCreated(quill: any): void {
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('image', this.imageHandler.bind(this));
    this.editor = quill;
  }

  imageHandler() {
    const imageinput = document.createElement('input');
    imageinput.setAttribute('type', 'file');
    imageinput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
    imageinput.classList.add('ql-image');
    // imageinput.addEventListener('change', () => {
    //   if (imageinput.files != null && imageinput.files[0] != null) {
    //     const formData = new FormData();
    //     Object.entries(this.formData).forEach(([key, value]) => {
    //       formData.append(key, value);
    //     });
    //     formData.append('file', (imageinput?.files || [])[0]);

    //     this.appAttachApiServ.uploadAppFileInfos(formData)
    //       .subscribe(res => {
    //         const range = this.editor.getSelection(true);
    //         const imageSrc = this.combineDownloadAttUrl(res[0].id);
    //         this.editor.insertEmbed(range.index, 'image', imageSrc);
    //       });
    //   }
    // });
    imageinput.click();
  }
}
