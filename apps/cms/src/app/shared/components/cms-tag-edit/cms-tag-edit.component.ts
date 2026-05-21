import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'cms-tag-edit',
  templateUrl: './cms-tag-edit.component.html',
  styleUrls: ['./cms-tag-edit.component.scss']
})
export class CmsTagEditComponent implements OnInit {
  isInputVisible = false;
  inputsearchValue = '';
  inputValue = '';

  // IOs
  @Input() tags: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();
  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef;

  ngOnInit(): void {
    console.log('init');

  }

  handleClose(tag: string): void {
    this.tags = this.tags.filter(x => x !== tag);
    this.tagsChange.emit(this.tags);
  }


  handleInputConfirm() {
    if (this.inputValue && this.tags.indexOf(this.inputValue) === -1) {
      this.tags = [...this.tags, this.inputValue];
      this.tagsChange.emit(this.tags);
    }
    this.inputsearchValue = '';
    this.isInputVisible = false;
  }

  showInput(): void {
    this.isInputVisible = true;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
    }, 10);
  }
}
