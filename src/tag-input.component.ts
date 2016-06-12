import {Component, HostBinding, Input} from '@angular/core';
import {NgControl} from '@angular/common';
import {isBlank} from '@angular/common/src/facade/lang';
import {TagInputItemComponent} from './tag-input-item.component';

@Component({
    selector: 'tag-input',
    template: `<tag-input-item
    [text]="tag"
    [index]="index"
    [selected]="selectedTag === index"
    (tagRemoved)="_removeTag($event)"
    *ngFor="let tag of tagsList; let index = index">
  </tag-input-item>
  <input
    class="ng2-tag-input-field"
    type="text"
    [placeholder]="placeholder"
    [(ngModel)]="inputValue"
    (paste)="inputPaste($event)"
    (keydown)="inputChanged($event)"
    (blur)="inputBlurred($event)"
    (focus)="inputFocused()"
    #tagInputRef>`,

    styles    : [`
    :host {
      display: block;
      box-shadow: 0 1px #ccc;
      padding: 5px 0;
    }

    :host.ng2-tag-input-focus {
      box-shadow: 0 2px #0d8bff;
    }

    .ng2-tag-input-field {
      display: inline-block;
      width: auto;
      box-shadow: none;
      border: 0;
    }
  `],
    directives: [TagInputItemComponent]
})
export class TagInputComponent {
    @Input() placeholder :string = 'Add a tag';
    @Input() ngModel :string[];
    @Input() delimiters :string = ",:;";
    @Input() tagIdentifierFront :string = "#";
    @Input() addOnBlur :boolean = true;
    @Input() addOnEnter :boolean = true;
    @Input() addOnPaste :boolean = true;
    @Input() allowedTagsPattern :RegExp = /.+/;
    @Input() resetInputAfterTagCreation :boolean;
    @HostBinding('class.ng2-tag-input-focus') isFocussed;


    private createTagsByPattern :RegExp = new RegExp(`(${this.tagIdentifierFront}\\b\\w+)|(\\w+[${this.delimiters}])`, "g");
    public tagsList :string[] = [];
    public inputValue :string = '';
    public selectedTag :number;

    constructor(private _ngControl :NgControl) {
        this._ngControl.valueAccessor = this;
    }

    ngOnInit() {
        if (this.ngModel) this.tagsList = this.ngModel;
        this.onChange(this.tagsList);
    }

    inputChanged(event) {
        let key = event.keyCode;
        let matches :string[];
        switch (key) {
            case 8: // Backspace
                this._handleBackspace();
                break;
            case 13: //Enter
                this.addOnEnter && this._addTags([this.inputValue]);
                event.preventDefault();
                break;
            case 32: //Space
                this._extractTags() && event.preventDefault();
                break;
            default:
                this._resetSelected();
                break;
        }
    }

    inputBlurred(event) {
        this.addOnBlur && this._extractTags();
        this.isFocussed = false;
    }

    inputFocused(event) {
        this.isFocussed = true;
    }

    inputPaste(event) {
        this._extractTags();
    }

    // private _splitString(tagString: string) {
    //   tagString = tagString.trim();
    //   let tags = tagString.split((this.delimiterCode));
    //   return tags.filter((tag) => !!tag);
    // }
    private _extractTags() :boolean {
        if (this.createTagsByPattern.test(this.inputValue)) {
            let matches = this.inputValue.match(this.createTagsByPattern);
            matches = matches.map((match) =>
                match.replace(new RegExp('[' + this.tagIdentifierFront + this.delimiters + ']', 'g'), '')
            );
            this.inputValue = this.inputValue.replace(this.createTagsByPattern, "");
            this._addTags(matches);
            return true;
        } else {
            return false;
        }
    }

    private _isTagValid(tagString :string) {
        return this.allowedTagsPattern.test(tagString);
    }

    private _addTags(tags :string[]) {
        let validTags = tags.filter((tag) => this._isTagValid(tag));
        this.tagsList = this.tagsList.concat(validTags);
        this._resetSelected();
        if (this.resetInputAfterTagCreation)
            this._resetInput();
        this.onChange(this.tagsList);
    }

    private _removeTag(tagIndexToRemove) {
        this.tagsList.splice(tagIndexToRemove, 1);
        this._resetSelected();
        this.onChange(this.tagsList);
    }

    private _handleBackspace() {
        if (!this.inputValue.length && this.tagsList.length) {
            if (!isBlank(this.selectedTag)) {
                this._removeTag(this.selectedTag);
            }
            else {
                this.selectedTag = this.tagsList.length - 1;
            }
        }
    }

    private _resetSelected() {
        this.selectedTag = null;
    }

    private _resetInput() {
        this.inputValue = '';
    }

    /** Implemented as part of ControlValueAccessor. */
    onChange :(value :any) => any = (value) => {
    };

    onTouched :() => any = () => {
    };

    writeValue(value :any) {
    }

    registerOnChange(fn :any) {
        this.onChange = fn;
    }

    registerOnTouched(fn :any) {
        this.onTouched = fn;
    }
}
