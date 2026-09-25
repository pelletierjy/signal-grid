import { computed, Directive, effect, input, InputSignal, signal, Signal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { CallbackParameter, ColumnConfiguration } from '../models/models';
import { CellProps } from '../registry/cell-type-config';

export interface ICellComponent {
  columns: InputSignal<ColumnConfiguration[]>;
  column: InputSignal<ColumnConfiguration>;
  formGroup: InputSignal<FormGroup>;
  index: InputSignal<number>;
  rowGroup: Signal<FormGroup>;
  formControl: Signal<AbstractControl>;
  value: Signal<unknown>;
  callbackParameter: Signal<CallbackParameter>;
  isEditable: Signal<boolean>;
  props: Signal<CellProps>;
  setValue(value: unknown): void;
}

/**
 * Base class for every cell type component, built-in or custom.
 * Columns on the same field share one form control, so the grid never disables it.
 * Read-only is enforced by `setValue()` and by what each type renders.
 */
@Directive()
export abstract class BaseCellComponent implements ICellComponent {
  columns = input.required<ColumnConfiguration[]>();
  column = input.required<ColumnConfiguration>();
  formGroup = input.required<FormGroup>();
  index = input.required<number>();

  rowGroup = computed(() => this.formGroup().controls[this.index()] as FormGroup);
  formControl = computed<AbstractControl>(() => this.rowGroup()?.get(this.column().fieldName));

  private readonly _changes = signal(0);
  value = computed<unknown>(() => {
    this._changes();
    return this.formControl()?.value;
  });

  callbackParameter = computed(
    () =>
      new CallbackParameter(
        this.value(),
        this.formGroup(),
        this.index(),
        () => this.column().fieldName
      )
  );
  isEditable = computed(() => this.column().isEditable?.(this.callbackParameter()) ?? false);
  props = computed<CellProps>(() => {
    const props = this.column().props;
    return (typeof props === 'function' ? props(this.callbackParameter()) : props) ?? {};
  });

  constructor() {
    effect(onCleanup => {
      const control = this.formControl();
      if (!control) {
        return;
      }
      const subscription = control.valueChanges.subscribe(() => this._changes.update(n => n + 1));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /**
   * Writes `value` to the cell's form control and marks it dirty, but only while the cell is editable.
   * Calling `formControl().setValue()` directly bypasses this read-only guard.
   */
  setValue(value: unknown): void {
    if (!this.isEditable()) {
      return;
    }
    const control = this.formControl();
    control.setValue(value);
    control.markAsDirty();
  }
}
