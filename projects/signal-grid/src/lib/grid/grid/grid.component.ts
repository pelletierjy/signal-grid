import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, Type } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { map, switchMap } from 'rxjs/operators';
import { Model } from '../models/model';
import { ColumnConfiguration, SignalGridFilterFormConfig } from '../models/models';
import { RowComponent } from '../row/row.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'signal-grid',
  standalone: true,
  imports: [RowComponent, ScrollingModule, ReactiveFormsModule, FormlyModule, CommonModule],
  templateUrl: 'grid.component.html',
  styleUrls: ['grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridComponent {
  model = input.required<Model[]>();
  columns = input.required<ColumnConfiguration[]>();
  includeRowExpander = input(false);
  modelChange = output<Model[]>();
  saveChanges = output<Model[]>();
  resetChanges = output<void>();
  filterFormConfig = input<SignalGridFilterFormConfig | null>(null);
  filterSubmit = output<Record<string, unknown>>();
  editable = input(true);
  rowExpanderConfig = input<Type<unknown>>(null);

  private readonly _columnWidths = signal<Record<string, number>>({});
  private readonly _formGroup = signal(new FormGroup({}));
  private readonly _isDirty = signal(false);

  get formGroup(): FormGroup {
    return this._formGroup();
  }
  isExpanded = signal<Record<number, boolean>>({});

  hasUnsavedChanges = computed(() => this._isDirty());
  isFormValid = computed(() => this._formGroup().valid);

  private readonly _formValueChanges = toSignal(
    toObservable(this._formGroup).pipe(
      switchMap(group => group.valueChanges.pipe(map(() => group.getRawValue()))))
  );

  gridTemplateColumns = computed(() => {
    const cols = this.columns();
    const widths = this._columnWidths();
    const includeExpander = this.showRowExpander();
    const parts: string[] = [];

    for (const col of cols) {
      const w = widths[col.fieldName] ?? col.getWidth?.() ?? col.width ?? 120;
      parts.push(`${w}px`);
    }
    if (includeExpander) {
      parts.push(`${this.expanderColWidth()}px`);
    }
    return parts.join(' ');
  }, { equal: (a, b) => a === b });

  columnWidthMap = computed(() => {
    const cols = this.columns();
    const widths = this._columnWidths();
    const result: Record<string, string> = {};
    for (const col of cols) {
      const w = widths[col.fieldName] ?? col.getWidth?.() ?? col.width ?? 120;
      result[col.fieldName] = `${w}px`;
    }
    return result;
  }, { equal: (a, b) => a === b });

  hasResizableColumns = computed(() => this.columns().some(c => c.resizable));
  expanderColWidth = computed(() => 40);
  showRowExpander = computed(() => this.includeRowExpander() || !!this.rowExpanderConfig());

  filterFormGroup = new FormGroup({});
  filterModel: Record<string, unknown> = {};

  trackByIndex = (index: number) => index;

  constructor() {
    // Build the form group structure once when columns and model are first available.
    let initialized = false;
    effect(() => {
      const columns = this.columns();
      const rows = this.model();
      if (initialized || columns.length === 0 || rows.length === 0) {
        return;
      }
      initialized = true;
      const formGroup = new FormGroup(
        Object.fromEntries(
          rows.map((row, index) => [
            index.toString(),
            new FormGroup(
              Object.fromEntries(
                columns.map(column => [column.fieldName, new FormControl(row[column.fieldName])])
              )
            )
          ])
        )
      );
      this._formGroup.set(formGroup);
      this._isDirty.set(false);
    });

    // When the model changes (e.g. after filtering, saving, or resetting),
    // rebuild the form group from scratch. This is faster than diffing 10,000+
    // rows with deepEqual, which was the bottleneck causing 8s filter times.
    // User edits are preserved by carrying over values from the previous form.
    effect(() => {
      const rows = this.model();
      if (!initialized) {
        return;
      }
      const columns = this.columns();
      const prevFg = this._formGroup();

      const formGroup = new FormGroup(
        Object.fromEntries(
          rows.map((row, index) => {
            const key = String(index);
            const prevRowGroup = prevFg.get(key) as FormGroup | null;
            const prevValues = prevRowGroup ? prevRowGroup.getRawValue() : {};
            return [
              key,
              new FormGroup(
                Object.fromEntries(
                  columns.map(column => [
                    column.fieldName,
                    // Preserve user edits if the row data hasn't changed
                    new FormControl(prevValues[column.fieldName] ?? row[column.fieldName])
                  ])
                )
              )
            ];
          })
        )
      );
      this._formGroup.set(formGroup);
    });

    // When a cell value changes, mark the form as dirty and propagate to the model output.
    effect(() => {
      const value = this._formValueChanges();
      if (!value) {
        return;
      }
      this._isDirty.set(true);
      this.modelChange.emit(Object.keys(value).map(key => value[key]));
    });
  }

  /** Mouse-down on a resize handle: sets up drag listeners. */
  resizeColumn(fieldName: string, widthPx: number): void {
    this._columnWidths.update(current => ({ ...current, [fieldName]: Math.max(30, widthPx) }));
  }

  startResize(payload: { event: MouseEvent; column: ColumnConfiguration }): void {
    const event = payload.event;
    const column = payload.column;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = this._columnWidths()[column.fieldName] ?? column.getWidth?.() ?? column.width ?? 120;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      this.resizeColumn(column.fieldName, startWidth + diff);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  onRowExpanderChange(index: number, expanded: boolean): void {
    this.isExpanded.update(m => ({ ...m, [index]: expanded }));
  }

  save(): void {
    const fg = this._formGroup();
    const rawValue = fg.getRawValue();
    const modelData = Object.keys(rawValue)
      .sort((a, b) => Number(a) - Number(b))
      .map(key => rawValue[key]);
    this.saveChanges.emit(modelData);
    fg.markAsPristine();
    this._isDirty.set(false);
  }

  reset(): void {
    const fg = this._formGroup();
    const rows = this.model();
    // Rebuild form with original values — faster than patching 10k+ controls individually
    const columns = this.columns();
    const formGroup = new FormGroup(
      Object.fromEntries(
        rows.map((row, index) => [
          String(index),
          new FormGroup(
            Object.fromEntries(
              columns.map(column => [column.fieldName, new FormControl(row[column.fieldName])])
            )
          )
        ])
      )
    );
    fg.markAsPristine();
    this._isDirty.set(false);
    this._formGroup.set(formGroup);
    this.resetChanges.emit();
  }

  onFilterSubmit(): void {
    this.filterSubmit.emit(this.filterFormGroup.getRawValue());
  }

  onFilterReset(): void {
    this.filterModel = {};
    this.filterFormGroup.reset();
    this.filterSubmit.emit(this.filterModel);
  }
}
