import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NgControl,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatFormFieldControl,
  MAT_FORM_FIELD,
} from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { SplitterService } from '../splitter.service';

@Component({
  selector: 'app-album-info-form',
  templateUrl: './album-info-form.component.html',
  styleUrls: ['./album-info-form.component.scss'],
})
export class AlbumInfoFormComponent implements OnInit {
  @Input() myForm: FormGroup;

  tracks = [];

  constructor(
    private splitter: SplitterService,
  ) {}

  ngOnInit(): void {}

  addTrack(value?: any) {
    const tracks = this.myForm.controls.tracks as FormArray;
    console.log(value);
    tracks.push(
      new FormGroup({
        ss: new FormControl(value?.ss ?? null, [Validators.required]),
        t: new FormControl(null),
        title: new FormControl(value?.title ?? null, [Validators.required]),
      })
    );
    this.tracks.push(null);
  }

  deleteTrack(i: number) {
    const tracks = this.myForm.controls.tracks as FormArray;
    tracks.removeAt(i);
    this.tracks.splice(i, 1);
  }

  async fromClipboard() {
    const items = await this.splitter.getTrackFromClipboard();
    console.log(items);
    items.forEach((item) => {
      this.addTrack(item)
    })
  }
}

/** Data structure for holding telephone number. */
export class MyTel {
  constructor(
    public area: string,
    public exchange: string,
    public subscriber: string
  ) {}
}

@Component({
  selector: 'app-track-ss-input',
  template: `
    <div
      role="group"
      class="example-tel-input-container"
      [formGroup]="parts"
      [attr.aria-labelledby]="_formField?.getLabelId()"
    >
      <input
        class="example-tel-input-element"
        formControlName="area"
        size="2"
        maxLength="2"
        aria-label="Area code"
        (input)="_handleInput(parts.controls.area, exchange)"
        #area
      />
      <span class="example-tel-input-spacer">:</span>
      <input
        class="example-tel-input-element"
        formControlName="exchange"
        maxLength="2"
        size="2"
        aria-label="Exchange code"
        (input)="_handleInput(parts.controls.exchange, subscriber)"
        (keyup.backspace)="autoFocusPrev(parts.controls.exchange, area)"
        #exchange
      />
      <span class="example-tel-input-spacer">:</span>
      <input
        class="example-tel-input-element"
        formControlName="subscriber"
        maxLength="2"
        size="2"
        aria-label="Subscriber number"
        (input)="_handleInput(parts.controls.subscriber)"
        (keyup.backspace)="autoFocusPrev(parts.controls.subscriber, exchange)"
        #subscriber
      />
    </div>
  `,
  styles: [
    `
      .example-tel-input-container {
        display: flex;
      }

      .example-tel-input-element {
        border: none;
        background: none;
        padding: 0;
        outline: none;
        font: inherit;
        text-align: center;
      }

      .example-tel-input-spacer {
        opacity: 0;
        transition: opacity 200ms;
      }

      :host.example-floating .example-tel-input-spacer {
        opacity: 1;
      }
    `,
  ],
  providers: [
    { provide: MatFormFieldControl, useExisting: TrackSSInputComponent },
  ],
  host: {
    '[class.example-floating]': 'shouldLabelFloat',
    '[id]': 'id',
  },
})
export class TrackSSInputComponent {
  static nextId = 0;
  @ViewChild('area') areaInput: HTMLInputElement;
  @ViewChild('exchange') exchangeInput: HTMLInputElement;
  @ViewChild('subscriber') subscriberInput: HTMLInputElement;

  parts: FormGroup;
  stateChanges = new Subject<void>();
  focused = false;
  controlType = 'example-tel-input';
  id = `example-tel-input-${TrackSSInputComponent.nextId++}`;
  onChange = (_: any) => {};
  onTouched = () => {};

  get empty() {
    const {
      value: { area, exchange, subscriber },
    } = this.parts;

    return !area && !exchange && !subscriber;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input('aria-describedby') userAriaDescribedBy: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.parts.disable() : this.parts.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): string | null {
    if (this.parts.valid) {
      const {
        value: { area, exchange, subscriber },
      } = this.parts;
      return area +':' + exchange + ':' + subscriber;
    }
    return null;
  }
  set value(tel: string | null) {
    const items = tel?.split(':') ?? [null, null, null]
    if(items.length == 2) {
      items.splice(0,0, '00');
    }
    this.parts.setValue({ area: items[0], exchange: items[1], subscriber: items[2] });
    this.stateChanges.next();
  }

  get errorState(): boolean {
    return this.parts.invalid && this.parts.dirty;
  }

  constructor(
    formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    this.parts = formBuilder.group({
      area: [
        null,
        [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
      ],
      exchange: [
        null,
        [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
      ],
      subscriber: [
        null,
        [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
      ],
    });

    _focusMonitor.monitor(_elementRef, true).subscribe((origin) => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  autoFocusNext(
    control: AbstractControl,
    nextElement?: HTMLInputElement
  ): void {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, 'program');
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, 'program');
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.example-tel-input-container'
    )!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick() {
    if (this.parts.controls.subscriber.valid) {
      this._focusMonitor.focusVia(this.subscriberInput, 'program');
    } else if (this.parts.controls.exchange.valid) {
      this._focusMonitor.focusVia(this.subscriberInput, 'program');
    } else if (this.parts.controls.area.valid) {
      this._focusMonitor.focusVia(this.exchangeInput, 'program');
    } else {
      this._focusMonitor.focusVia(this.areaInput, 'program');
    }
  }

  writeValue(tel: any | null): void {
    this.value = tel;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
  }

  static ngAcceptInputType_disabled: boolean | string | null | undefined;
  static ngAcceptInputType_required: boolean | string | null | undefined;
}
