import { computed, Directive, inject, input, InputSignal, Signal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { CallbackParameter, ColumnConfiguration } from '../models/models';
import { CellProps } from '../registry/cell-type-config';
import { GridStore } from '../services/grid-store';

export interface ICellComponent {
  columns: InputSignal<ColumnConfiguration[]>;
  column: InputSignal<ColumnConfiguration>;
  rowKey: InputSignal<string>;
  rowIndex: InputSignal<number>;
  rowGroup: Signal<FormGroup | undefined>;
  formControl: Signal<AbstractControl | undefined>;
  value: Signal<unknown>;
  callbackParameter: Signal<CallbackParameter>;
  isEditable: Signal<boolean>;
  props: Signal<CellProps>;
  setValue(value: unknown): void;
}

/**
 * Base class for every cell type component, built-in or custom.
 *
 * Cells are created by the grid's `sgCell` outlet, which passes context through
 * four inputs (`columns`, `column`, `rowKey`, `rowIndex`). Values are read
 * through signals derived from the {@link GridStore} — there is **no
 * `valueChanges` subscription per cell**; the store owns one subscription per
 * rendered row and exposes per-row `version`/`dirty` signals instead.
 *
 * Columns on the same field share one form control, so the grid never disables
 * it. Read-only is enforced by `setValue()` and by what each type renders.
 */
@Directive()
export abstract class BaseCellComponent implements ICellComponent {
  columns = input.required<ColumnConfiguration[]>();
  column = input.required<ColumnConfiguration>();
  rowKey = input<string>(null);
  rowIndex = input<number>(null);

  protected readonly store = inject(GridStore);

  rowGroup = computed(() => this.store.group(this.rowKey())() ?? undefined);

  formControl = computed<AbstractControl | undefined>(
    () => this.rowGroup()?.get(this.column().fieldName)
  );

  /**
   * Recomputes when the row's store version bumps (any value/status change in
   * the row) or when the row's group instance changes (re-attach, reset).
   */
  value = computed<unknown>(() => {
    this.store.version(this.rowKey())();
    return this.formControl()?.value;
  });

  callbackParameter = computed(
    () =>
      new CallbackParameter(
        this.value(),
        this.rowGroup(),
        this.rowIndex(),
        () => this.column().fieldName
      )
  );

  isEditable = computed(() => {
    const fn = this.column().isEditable;
    if (!fn) {
      return false;
    }
    return fn(this.callbackParameter());
  });

  props = computed<CellProps>(() => {
    const props = this.column().props;
    if (!props) {
      return {};
    }
    if (typeof props === 'function') {
      return props(this.callbackParameter()) ?? {};
    }
    return props;
  });

  /**
   * Writes `value` to the cell's form control, but only while the cell is
   * editable. The store's row subscription records the edit and bumps the
   * row's version — no explicit dirty handling needed here.
   * Calling `formControl().setValue()` directly bypasses this read-only guard.
   */
  setValue(value: unknown): void {
    if (!this.isEditable()) {
      return;
    }
    const control = this.formControl();
    if (!control) {
      return;
    }
    control.setValue(value);
    control.markAsDirty();
  }
}
